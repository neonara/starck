# stark
# Solar Installation Management Platform

## Project Overview

A web platform for managing and tracking solar installations with two distinct access levels: administrator (installer) and client (owner).

## Technologies Stack

- **Backend**: Django
- **Frontend**: Vite.js
- **Database**: PostgreSQL

## Features

### Administrator Interface

#### Dashboard
- Overview of installations (operational/faulty)
- Active alarms with criticality levels
- Searchable installation summary table

#### Installation Management
- Add new solar power plants
- Historical data import
- Detailed installation view
- Technical dashboard

#### Reporting
Customizable report generation:
- Production (monthly, annual, total)
- Consumption (monthly, annual, total)
- Alarm history

#### Alarm System
- Alarm code database by inverter brand
- Notification system
- Alarm tracking interface

#### Interactive Map
Geographical installation visualization with:
- Daily production
- Monthly production
- Generated revenues
- Alarm status

#### Intervention Management
- Create intervention reports
- Maintenance scheduling
- Client complaint tracking

### Client Interface

#### Home Page
- Installation overview
- Operational status
- Installation photos

#### Dashboard
Real-time statistics:
- Daily production
- Monthly production
- Total production
- Total consumption
- Equipment status
- Alerts and alarms
- Production and consumption graphs

#### Administrative Management
- Report generation
- Self-reading system
- Complaint tracking
- Account settings

## Technical Specifications

### Backend Architecture
- REST API with Django
- PostgreSQL database
- JWT authentication
- Role-based permission management

### Frontend Architecture
- SPA with Vite.js
- Responsive interface
- Reusable components
- Interactive dashboards

### Database Entities
- Users
- Installations
- Equipment
- Alarms
- Production data
- Interventions
- Reports

## Technical Constraints

### Performance
- Loading time < 3 seconds
- Simultaneous support for 100+ users
- Real-time data updates

### Security
- Secure authentication
- Sensitive data encryption
- SQL injection protection
- Daily data backup

### Compatibility
- Browsers: Chrome, Firefox, Safari, Edge
- Responsive: Desktop, Tablet, Mobile
- Minimum connection: 1 Mbps

## Installation

### Prerequisites
- Python 3.9+
- Node.js 14+
- PostgreSQL 12+

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/solar-platform.git

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment
[Add specific deployment instructions]

## Contributing
[Add contribution guidelines]

## License
[Specify project license]

## Contact
[Add contact information]
