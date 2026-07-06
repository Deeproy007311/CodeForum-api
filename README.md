# CodeForum API

A REST API backend for a developer discussion forum. Users can register, post programming questions, answer questions, vote on content, use AI tools, manage AI usage limits, and upgrade to a Pro plan through Razorpay Test Mode.

## Features

- User registration and login using JWT authentication
- User profile endpoint
- Create, edit, delete, and browse questions
- Create, edit, accept, and fetch answers
- Upvote and downvote questions and answers
- AI-generated answers using Groq
- AI question improvement
- AI code explanation
- AI response caching
- AI request history
- Monthly AI usage tracking
- Free and Pro AI limits
- Subscription management
- Razorpay Test Mode order creation and payment verification
- Automatic Pro subscription expiry check
- Global error handling
- Rate limiting for AI endpoints
- Health check endpoint

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- Groq SDK
- Razorpay
- Node Cache

## Project Setup

Clone the repository:

```bash
git clone <your-repository-url>
cd CodeForum-api