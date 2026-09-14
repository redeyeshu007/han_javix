FROM python:3.12-slim

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY ./requirements/base.txt /app/requirements/base.txt
COPY ./requirements/development.txt /app/requirements/development.txt

RUN pip install --upgrade pip && \
    pip install -r requirements/development.txt

# Copy project files
COPY . /app/
