import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!pageAccessToken) {
      return NextResponse.json(
        { error: 'Facebook credentials not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { commentId, message } = body;

    if (!commentId || !message) {
      return NextResponse.json(
        { error: 'Comment ID and message are required' },
        { status: 400 }
      );
    }

    // Reply to comment using Facebook Graph API
    const replyResponse = await fetch(
      `https://graph.facebook.com/v18.0/${commentId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          access_token: pageAccessToken,
        }),
      }
    );

    const replyData = await replyResponse.json();

    if (!replyResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to reply to comment', details: replyData },
        { status: replyResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      reply: replyData,
    });
  } catch (error: any) {
    console.error('Error replying to comment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
