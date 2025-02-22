# Use the official PostgreSQL image as the base image
FROM postgres:14

# Set the environment variables for PostgreSQL
ENV POSTGRES_DB ${DB_NAME}
ENV POSTGRES_USER ${DB_USER}
ENV POSTGRES_PASSWORD ${DB_PASSWORD}

# Copy the SQL script to initialize the database
COPY ./docker/initializers/init.sql /docker-entrypoint-initdb.d/
