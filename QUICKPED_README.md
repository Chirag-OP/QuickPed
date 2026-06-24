# QuickPed - Smart Campus Bike Sharing Platform

A modern, premium mobile-first bike-sharing application designed for campus environments.

## 🚀 Features

### User Features

#### 1. **Welcome & Onboarding**
- Animated 5-second welcome screen with moving bike animations
- Progressive login flow with OTP verification
- Institutional email verification for Verified Riders
- Modern onboarding with progress indicators

#### 2. **Home Dashboard**
- Real-time wallet balance display
- Large "Scan & Ride" primary action button
- Interactive campus map section
- Nearby dock cards with availability
- Quick access to profile, notifications, and dark mode toggle
- Activity statistics (total rides, total time)

#### 3. **Active Ride Experience**
- Live ride timer with smooth animations
- Real-time fare counter
- Pulse animation around active ride card
- Lock/Unlock bike controls
- Battery status indicator
- SOS emergency button with campus security contact
- End ride functionality

#### 4. **Wallet Management**
- Current balance display with gradient card
- Quick add money with UPI/Card options
- Transaction history with categorized entries
- Modern bottom sheet for add money flow

#### 5. **Ride History**
- Comprehensive ride cards with details
- Date, duration, fare, and route information
- Statistics overview (total rides, time, spent)
- Beautiful visual hierarchy

#### 6. **Profile Management**
- User information display
- Verified rider badge
- Contact information (email, phone)
- Settings menu (notifications, privacy, help, terms)
- Logout functionality

#### 7. **Bike Condition Reporting**
- Post-ride issue reporting system
- Issue categories: Flat Tire, Brake Failure, Chain Issue, Battery Issue, Other
- Optional detailed description
- Thank you confirmation screen

#### 8. **Ride Completion**
- Beautiful completion screen with animations
- Ride summary (fare, duration, distance, route)
- 5-star rating system
- Smooth transitions to issue reporting

### Admin Features

#### 9. **Admin Dashboard**
- Real-time statistics cards
  - Total rides today with trend indicators
  - Revenue tracking
  - User count
  - Fleet status overview
- Fleet status breakdown (Available, In Ride, Maintenance, Low Battery)
- Recent alerts system with severity indicators
- Dock status overview with capacity visualization
- Modern SaaS-style design

#### 10. **Fleet Management**
- Complete bike list with search
- Status filtering (All, Available, In Ride, User Locked, Maintenance)
- Individual bike cards showing:
  - Bike ID and status
  - Battery level with color coding
  - Location and last ride time
  - Total rides count
  - Condition alerts
- Quick settings access

#### 11. **User Management**
- User list with search functionality
- User statistics (Total users, Verified users, Wallet balance)
- Detailed user cards displaying:
  - Name and verification status
  - Email and phone
  - Wallet balance
  - Total rides
  - Member since date

## 🎨 Design System

### Color Palette
- **Primary (Green)**: `#10b981` - Main brand color for bikes and primary actions
- **Secondary (Blue)**: `#3b82f6` - Secondary actions and accents
- **Success**: `#10b981` - Positive states
- **Warning**: `#f59e0b` - Warnings and medium-priority alerts
- **Danger**: `#ef4444` - Errors and critical alerts

### Theme Support
- **Light Mode**: Clean, bright interface with subtle shadows
- **Dark Mode**: Deep dark backgrounds with vibrant accent colors
- Smooth theme transitions
- Persistent theme selection

### UI Components
- Rounded cards (radius: 1rem)
- Smooth animations using Motion (formerly Framer Motion)
- Glass morphism effects on overlays
- Gradient backgrounds for headers
- Shadow effects with color-matched glows
- Bottom sheet modals for mobile

### Typography
- System font stack for optimal performance
- Responsive font sizes
- Clear hierarchy (headings, body, labels)

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Motion** - Animations
- **Lucide React** - Icons
- **Radix UI** - Accessible components
- **React Router** - Navigation (ready for future expansion)

## 📱 Navigation

### Bottom Navigation (User Mode)
- Home
- Scan (prominent center button)
- History
- Wallet
- Profile

### Admin Navigation
- Dashboard
- Fleet Management
- User Management
- Exit Admin button

## 🚦 User Flow

1. **Welcome Screen** (5 seconds) → Auto-transition
2. **Login Screen** → Phone OTP → Email Verification
3. **Home Dashboard** → Scan QR Code
4. **Scan Screen** → Auto-detect QR
5. **Active Ride** → Live tracking
6. **End Ride** → Ride Complete Screen
7. **Rate Ride** → Report Issues (optional)
8. **Back to Home**

## 🎯 Key Features

### Mobile-First Design
- Optimized for mobile screens
- Touch-friendly buttons and controls
- Swipe gestures support
- Safe area handling for notched devices

### Premium UI/UX
- Smooth micro-interactions
- Pulse animations for active states
- Skeleton loading states
- Success/error feedback animations
- Bottom sheets for modal content

### Real-time Updates
- Live ride timer
- Live fare counter
- Battery status monitoring
- Dock availability updates

### Safety Features
- SOS emergency button with quick contacts
- Battery level warnings before ride
- Bike condition reporting
- Lock/unlock controls during ride

## 🔄 State Management

Simple React state management with:
- Screen navigation state
- Active ride tracking
- Theme persistence
- User session management

## 🎭 Demo Mode

Toggle between User and Admin modes using the "Admin Mode" button on the home screen to explore both interfaces.

## 🌟 Investor-Ready Features

1. **Complete User Journey** - From onboarding to ride completion
2. **Admin Dashboard** - Full fleet and user management
3. **Real-time Tracking** - Live ride and fare monitoring
4. **Safety Features** - SOS, battery alerts, issue reporting
5. **Modern Design** - Premium UI following latest design trends
6. **Scalable Architecture** - Ready for expansion

## 📊 Sample Data

The app includes realistic sample data for:
- 5 bikes with various statuses
- 5 transaction history entries
- 5 ride history records
- 4 users with different profiles
- 4 docks with availability

## 🚀 Future Enhancements

- Real-time GPS tracking
- Payment gateway integration
- Push notifications
- Analytics dashboard
- Multi-language support
- Offline mode support
- Social features (referrals, leaderboard)
- Advanced route planning

---

**QuickPed** - Revolutionizing campus mobility, one ride at a time. 🚴‍♂️💚
