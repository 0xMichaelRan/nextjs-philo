# Philo Backend API Architecture

An AI-powered movie analysis video generation platform built with FastAPI and PostgreSQL, featuring phone number authentication, TTS audio caching, real-time notifications, and VIP subscription system.

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- PostgreSQL database
- RabbitMQ message broker
- uv package manager
- Qiniu Cloud Storage (for video files)

### Installation & Setup

```bash
# Clone and navigate to project
cd python-philo

# Install dependencies
uv sync
uv sync --group test

# Set up environment variables (copy from .env.example)
cp .env.example .env
# Edit .env with your configuration

# Start the server
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8009
```

### RabbitMQ Setup

```bash
# Start RabbitMQ with Docker
docker rm -f rabbitmq
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=guest \
  -e RABBITMQ_DEFAULT_PASS=guest \
  rabbitmq:3-management

# Management UI: http://localhost:15672/#/queues
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: FastAPI with async/await
- **Database**: PostgreSQL with SQLAlchemy (async)
- **Message Queue**: RabbitMQ with aio-pika
- **Authentication**: Phone number + SMS verification
- **Storage**: Qiniu Cloud Object Storage
- **Caching**: Redis for TTS audio caching
- **Real-time**: Server-Sent Events (SSE)

### Core Components

#### 1. Authentication System
- Phone number-based registration/login
- SMS verification with configurable providers
- JWT token management with refresh tokens
- VIP subscription system with tier-based features

#### 2. Movie Analysis Pipeline
- Text extraction and cleaning from movie content
- AI-powered analysis and summarization
- User editing capabilities for analysis results
- Multi-language support (Chinese/English)

#### 3. Video Generation System
- AMQP-based job submission to python-renderer
- Real-time progress tracking via SSE
- Queue metrics and estimated processing time
- Completion notifications and status updates

#### 4. TTS Audio Management
- Multi-provider TTS integration (Xfyun, OpenAI, Google)
- Audio caching system with Redis
- Voice selection and customization
- Speed parameter support (0-100 scale)

#### 5. Real-time Notification System
- Server-Sent Events for job updates
- AMQP completion consumer for status updates
- Queue metrics broadcasting (pending_jobs, estimated_time)
- Frontend integration with automatic reconnection

### Database Schema

#### Core Tables
- `users`: User accounts with phone authentication
- `movies`: Movie metadata and content files
- `analysis_jobs`: Text analysis and editing
- `video_jobs`: Video generation requests
- `tts_audio_cache`: Cached TTS audio files
- `vip_subscriptions`: User subscription management

#### Key Relationships
- Users → Analysis Jobs (1:N)
- Analysis Jobs → Video Jobs (1:N)
- Users → VIP Subscriptions (1:1)
- Video Jobs → TTS Cache (N:M)

### API Endpoints

#### Authentication
- `POST /auth/send-verification`: Send SMS verification
- `POST /auth/verify-phone`: Verify phone and login
- `POST /auth/refresh`: Refresh JWT tokens

#### Movie Management
- `GET /movies/`: List available movies
- `GET /movies/{movie_id}`: Get movie details
- `POST /analysis-jobs/`: Create analysis job
- `PUT /analysis-jobs/{job_id}`: Update analysis

#### Video Generation
- `POST /video-jobs/`: Create video generation job
- `GET /video-jobs/`: List user's video jobs
- `GET /video-jobs/{job_id}/video-url`: Get video URLs
- `GET /realtime/events`: SSE endpoint for real-time updates

### AMQP Integration

#### Queues
- `philo_jobs`: Job submission to python-renderer
- `philo_completion`: Completion notifications from renderer
- `philo_jobs_dlq`: Dead letter queue for failed jobs

#### Message Flow
1. Frontend submits video generation request
2. Backend creates video job in database
3. Job data sent to `philo_jobs` queue
4. Python-renderer processes job
5. Completion notification sent to `philo_completion` queue
6. Backend updates job status and broadcasts via SSE

### Real-time Updates Architecture

#### SSE Implementation
- Persistent connections for job status updates
- Automatic reconnection on connection loss
- Queue metrics broadcasting (pending_jobs, estimated_time)
- Job-specific progress updates

#### AMQP Consumer
- Listens to `philo_completion` queue
- Updates database with job status
- Broadcasts updates via SSE to connected clients
- Logs queue metrics for monitoring

### Performance Optimizations

#### Database
- Async SQLAlchemy with connection pooling
- Indexed queries for user and job lookups
- Efficient pagination for job listings

#### Caching
- Redis-based TTS audio caching
- Cache key generation based on text + voice + speed
- Automatic cache expiration and cleanup

#### AMQP
- Connection pooling and automatic reconnection
- Message acknowledgment for reliability
- Dead letter queue for failed job handling

### Security Features

#### Authentication
- Phone number verification with SMS
- JWT tokens with configurable expiration
- Refresh token rotation for security

#### Data Protection
- Input validation and sanitization
- SQL injection prevention via SQLAlchemy
- CORS configuration for frontend integration

#### VIP System
- Tier-based feature access control
- Subscription validation middleware
- Usage tracking and limits

### Monitoring and Logging

#### Health Checks
- Database connectivity monitoring
- AMQP connection status
- Redis cache availability

#### Performance Metrics
- Job processing times and queue metrics
- TTS cache hit rates
- User activity and subscription analytics

#### Error Handling
- Comprehensive exception handling
- Structured logging with correlation IDs
- Dead letter queue for failed jobs

### Development Guidelines

1. **Async/Await**: Use async patterns for all I/O operations
2. **Type Hints**: Comprehensive type annotations with Pydantic models
3. **Error Handling**: Proper exception handling with user-friendly messages
4. **Testing**: Unit tests with pytest and async test fixtures
5. **Documentation**: API documentation with FastAPI's automatic OpenAPI
6. **Code Quality**: Consistent formatting and linting standards

### Deployment Considerations

#### Environment Variables
- Database connection strings
- AMQP broker URLs
- Cloud storage credentials
- SMS provider configuration
- JWT secret keys

#### Scaling
- Horizontal scaling with multiple worker instances
- Database connection pooling
- AMQP consumer scaling
- Redis cluster for caching

#### Monitoring
- Health check endpoints for load balancers
- Structured logging for centralized monitoring
- Performance metrics collection
- Error tracking and alerting
