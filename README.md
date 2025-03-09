# Cinelight Frontend

A complete frontend solution for Cinelight, providing quotation systems, delivery order tracking, invoice generation, and inventory management with analytics dashboards.

## Features

- **Quotation Module**: Create quotes with Excel/PDF export
- **Delivery Order Module**: Link to approved quotes and track item allocation
- **Invoice Module**: Generate invoices automatically from approved quotes
- **Inventory Management**: Real-time tracking of item availability and rental status
- **Analytics Dashboards**: Track quotation-to-invoice conversion rates and popular rented items

## Technologies Used

- React
- TypeScript
- Material UI
- Chart.js for analytics
- jsPDF for PDF generation
- XLSX for Excel export
- Formik + Yup for form validation

## Getting Started

### Prerequisites

- Node.js >= 14.x
- npm >= 6.x

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm start
```

### Building for Production

```bash
npm run build
```

## Project Structure

- `src/api` - API service calls
- `src/components` - Reusable UI components
- `src/contexts` - React contexts for state management
- `src/hooks` - Custom React hooks
- `src/models` - TypeScript interfaces and types
- `src/pages` - Application pages
- `src/utils` - Utility functions

## Contributing

Please follow the existing code style and conventions. Make sure all tests pass before submitting a pull request.