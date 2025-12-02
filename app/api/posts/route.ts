import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    if (!pageAccessToken || !pageId) {
      return NextResponse.json(
        { error: 'Facebook credentials not configured' },
        { status: 500 }
      );
    }

    // Fetch posts from Facebook Page
    const postsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,permalink_url&limit=25&access_token=${pageAccessToken}`
    );

    if (!postsResponse.ok) {
      const errorData = await postsResponse.json();
      return NextResponse.json(
        { error: 'Failed to fetch posts', details: errorData },
        { status: postsResponse.status }
      );
    }

    const postsData = await postsResponse.json();
    const posts = postsData.data || [];

    // Fetch comments for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post: any) => {
        try {
          const commentsResponse = await fetch(
            `https://graph.facebook.com/v18.0/${post.id}/comments?fields=id,message,created_time,from{id,name,picture},can_reply_comment&limit=100&access_token=${pageAccessToken}`
          );

          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            return {
              ...post,
              comments: commentsData.data || [],
              commentsCount: commentsData.data?.length || 0,
            };
          }
          return { ...post, comments: [], commentsCount: 0 };
        } catch (error) {
          console.error(`Error fetching comments for post ${post.id}:`, error);
          return { ...post, comments: [], commentsCount: 0 };
        }
      })
    );

    // Filter posts that have comments
    const postsWithCommentsOnly = postsWithComments.filter(
      (post: any) => post.commentsCount > 0
    );

    return NextResponse.json({
      posts: postsWithCommentsOnly,
      total: postsWithCommentsOnly.length,
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
