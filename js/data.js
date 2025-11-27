// ===================================
// HARDCODED TRACKING DATA
// ===================================

const trackingDatabase = {
  'TRACK001': {
    trackingCode: 'TRACK001',
    status: 'in-transit',
    statusText: 'In Transit',
    progress: 65,
    eta: 'Today, 4:30 PM',
    origin: {
      city: 'New York, NY',
      coordinates: [-74.006, 40.7128]
    },
    destination: {
      city: 'Los Angeles, CA',
      coordinates: [-118.2437, 34.0522]
    },
    currentLocation: {
      city: 'Phoenix, AZ',
      coordinates: [-112.0740, 33.4484]
    },
    packageDetails: {
      weight: '2.5 kg',
      courier: 'FastShip Express',
      service: 'Express Delivery'
    },
    route: [
      [-74.006, 40.7128],    // New York
      [-80.1918, 25.7617],   // Miami (waypoint)
      [-95.3698, 29.7604],   // Houston
      [-106.4424, 31.7619],  // El Paso
      [-112.0740, 33.4484],  // Phoenix (current)
      [-114.0719, 33.7175],  // Yuma
      [-118.2437, 34.0522]   // Los Angeles
    ],
    timeline: [
      {
        status: 'completed',
        time: 'Nov 23, 9:00 AM',
        title: 'Package Picked Up',
        location: 'New York, NY'
      },
      {
        status: 'completed',
        time: 'Nov 23, 2:30 PM',
        title: 'Departed Facility',
        location: 'New York Distribution Center'
      },
      {
        status: 'completed',
        time: 'Nov 24, 6:15 AM',
        title: 'In Transit',
        location: 'Houston, TX'
      },
      {
        status: 'active',
        time: 'Nov 25, 11:45 AM',
        title: 'Arrived at Facility',
        location: 'Phoenix, AZ'
      },
      {
        status: 'pending',
        time: 'Nov 25, 3:00 PM',
        title: 'Out for Delivery',
        location: 'Los Angeles, CA'
      },
      {
        status: 'pending',
        time: 'Nov 25, 4:30 PM',
        title: 'Delivered',
        location: 'Los Angeles, CA'
      }
    ]
  },
  'TRACK002': {
    trackingCode: 'TRACK002',
    status: 'out-for-delivery',
    statusText: 'Out for Delivery',
    progress: 90,
    eta: 'Today, 2:00 PM',
    origin: {
      city: 'Chicago, IL',
      coordinates: [-87.6298, 41.8781]
    },
    destination: {
      city: 'Miami, FL',
      coordinates: [-80.1918, 25.7617]
    },
    currentLocation: {
      city: 'Miami, FL',
      coordinates: [-80.1918, 25.7617]
    },
    packageDetails: {
      weight: '1.2 kg',
      courier: 'QuickShip Logistics',
      service: 'Same Day Delivery'
    },
    route: [
      [-87.6298, 41.8781],   // Chicago
      [-84.3880, 33.7490],   // Atlanta
      [-80.1918, 25.7617]    // Miami
    ],
    timeline: [
      {
        status: 'completed',
        time: 'Nov 25, 6:00 AM',
        title: 'Package Picked Up',
        location: 'Chicago, IL'
      },
      {
        status: 'completed',
        time: 'Nov 25, 8:30 AM',
        title: 'Departed Facility',
        location: 'Chicago Distribution Center'
      },
      {
        status: 'completed',
        time: 'Nov 25, 11:00 AM',
        title: 'Arrived at Facility',
        location: 'Miami Distribution Center'
      },
      {
        status: 'active',
        time: 'Nov 25, 12:30 PM',
        title: 'Out for Delivery',
        location: 'Miami, FL'
      },
      {
        status: 'pending',
        time: 'Nov 25, 2:00 PM',
        title: 'Delivered',
        location: 'Miami, FL'
      }
    ]
  },
  'TRACK003': {
    trackingCode: 'TRACK003',
    status: 'delivered',
    statusText: 'Delivered',
    progress: 100,
    eta: 'Delivered Nov 24, 3:15 PM',
    origin: {
      city: 'Seattle, WA',
      coordinates: [-122.3321, 47.6062]
    },
    destination: {
      city: 'San Francisco, CA',
      coordinates: [-122.4194, 37.7749]
    },
    currentLocation: {
      city: 'San Francisco, CA',
      coordinates: [-122.4194, 37.7749]
    },
    packageDetails: {
      weight: '3.8 kg',
      courier: 'Express Courier Co.',
      service: 'Standard Delivery'
    },
    route: [
      [-122.3321, 47.6062],  // Seattle
      [-122.6765, 45.5231],  // Portland
      [-122.4194, 37.7749]   // San Francisco
    ],
    timeline: [
      {
        status: 'completed',
        time: 'Nov 22, 10:00 AM',
        title: 'Package Picked Up',
        location: 'Seattle, WA'
      },
      {
        status: 'completed',
        time: 'Nov 22, 1:00 PM',
        title: 'Departed Facility',
        location: 'Seattle Distribution Center'
      },
      {
        status: 'completed',
        time: 'Nov 23, 9:00 AM',
        title: 'In Transit',
        location: 'Portland, OR'
      },
      {
        status: 'completed',
        time: 'Nov 24, 1:00 PM',
        title: 'Arrived at Facility',
        location: 'San Francisco Distribution Center'
      },
      {
        status: 'completed',
        time: 'Nov 24, 2:30 PM',
        title: 'Out for Delivery',
        location: 'San Francisco, CA'
      },
      {
        status: 'completed',
        time: 'Nov 24, 3:15 PM',
        title: 'Delivered',
        location: 'San Francisco, CA'
      }
    ]
  }
};

// Function to get tracking data
function getTrackingData(code) {
  return trackingDatabase[code.toUpperCase()] || null;
}
