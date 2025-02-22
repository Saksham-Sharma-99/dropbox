# Dropbox REST API

## Prerequisites

ENVIRONMENT VARIABLES:

```bash
DB_USER=postgres
DB_HOST=localhost
DB_NAME=dropbox
DB_PASSWORD=postgres
DB_PORT=5432
PORT=4000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
HASH_ROUNDS=
```

## Setup Docker and Run Database

To set up the database using Docker, follow these steps:

1. **Install Docker**: If you haven't installed Docker yet, download it from [Docker's official website](https://www.docker.com/get-started).

2. **Clone the repository**:

```bash
   git clone https://github.com/saksham-sharma-99/dropbox-rest-api.git && cd dropbox-rest-api && docker-compose up -d
```

## Routes

### Postman Collection

- Dropbox Rest API.postman_collection.json

### User Routes

- POST /api/users - Create a new user

### Document Routes

- POST /api/documents - Create a new document
- GET /api/documents - Get a list of documents
- GET /api/documents/:id - Get document details
- PATCH /api/documents/:id - Update document details