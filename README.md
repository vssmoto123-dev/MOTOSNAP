# MOTOSNAP

A comprehensive motorcycle workshop management system with Spring Boot backend and Next.js frontend.

## Features

- **User Management**: Role-based access control (Customer, Mechanic, Admin)
- **Inventory Management**: Parts tracking with low stock alerts
- **Service Booking**: Schedule motorcycle services
- **Invoice System**: Generate and manage invoices with payment tracking
- **File Uploads**: Support for part images and payment receipts

## Tech Stack

- **Backend**: Spring Boot 3.5.5, Java 17, Spring Security, JPA/Hibernate
- **Frontend**: Next.js 15.5.2, React 19, TypeScript, Tailwind CSS
- **Database**: H2 (development), MySQL (production)
- **Authentication**: JWT with refresh tokens

## Deployment

This application is configured for deployment on Render.com with the included `render.yaml` configuration.

### Environment Variables

- `SPRING_PROFILES_ACTIVE`: Set to `prod` for production
- `JWT_SECRET`: JWT signing secret (auto-generated on Render)
- `UPLOAD_DIR`: Directory for file uploads (default: `./uploads`)

## API Documentation

See `API_DOCUMENTATION.md` for complete endpoint reference.

## Development

Refer to `CLAUDE.md` for development setup and guidelines.