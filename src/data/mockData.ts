export interface TrackingData {
  trackingCode: string;
  status: 'in-transit' | 'out-for-delivery' | 'delivered' | 'delayed';
  statusText: string;
  eta: string;
  progress: number;
  origin: {
    city: string;
    code: string;
    date: string;
    coordinates: [number, number];
  };
  destination: {
    city: string;
    code: string;
    eta: string;
    coordinates: [number, number];
  };
  currentLocation: {
    city: string;
    status: string;
    coordinates: [number, number];
  };
  packageDetails: {
    weight: string;
    dimensions: string;
    service: string;
    courier: string;
  };
  timeline: {
    time: string;
    date: string;
    title: string;
    location: string;
    status: string;
  }[];
  assignedCourier?: string;
  customerName?: string;
}

// In-memory store for the SPA
export let mockTrackingData: TrackingData[] = [
  {
    trackingCode: 'TRACK001',
    status: 'in-transit',
    statusText: 'In Transit',
    eta: 'Today, 4:30 PM',
    progress: 65,
    assignedCourier: 'John Smith',
    customerName: 'Alice Johnson',
    origin: {
      city: 'New York, NY',
      code: 'NYC',
      date: 'Nov 24, 08:00 AM',
      coordinates: [40.7128, -74.0060] // NY
    },
    destination: {
      city: 'Los Angeles, CA',
      code: 'LAX',
      eta: 'Nov 26, 04:30 PM',
      coordinates: [34.0522, -118.2437] // LA
    },
    currentLocation: {
      city: 'Phoenix, AZ',
      status: 'Departed Facility',
      coordinates: [33.4484, -112.0740] // Phoenix
    },
    packageDetails: {
      weight: '2.5 kg',
      dimensions: '30x20x10 cm',
      service: 'Express Delivery',
      courier: 'FastShip Express'
    },
    timeline: [
      {
        time: '10:30 AM',
        date: 'Today',
        title: 'Departed Facility',
        location: 'Phoenix, AZ',
        status: 'completed'
      },
      {
        time: '08:15 AM',
        date: 'Today',
        title: 'Arrived at Facility',
        location: 'Phoenix, AZ',
        status: 'completed'
      },
      {
        time: '06:00 PM',
        date: 'Yesterday',
        title: 'In Transit',
        location: 'Dallas, TX',
        status: 'completed'
      },
      {
        time: '09:00 AM',
        date: 'Yesterday',
        title: 'Package Picked Up',
        location: 'New York, NY',
        status: 'completed'
      }
    ]
  },
  {
    trackingCode: 'TRACK002',
    status: 'out-for-delivery',
    statusText: 'Out for Delivery',
    eta: 'Today, 2:00 PM',
    progress: 90,
    assignedCourier: 'John Smith',
    customerName: 'Bob Williams',
    origin: {
      city: 'Chicago, IL',
      code: 'ORD',
      date: 'Nov 25, 09:00 AM',
      coordinates: [41.8781, -87.6298]
    },
    destination: {
      city: 'Seattle, WA',
      code: 'SEA',
      eta: 'Nov 26, 02:00 PM',
      coordinates: [47.6062, -122.3321]
    },
    currentLocation: {
      city: 'Seattle, WA',
      status: 'Out for Delivery',
      coordinates: [47.6062, -122.3321]
    },
    packageDetails: {
      weight: '1.2 kg',
      dimensions: '20x15x10 cm',
      service: 'Standard Delivery',
      courier: 'FastShip Express'
    },
    timeline: [
      {
        time: '08:00 AM',
        date: 'Today',
        title: 'Out for Delivery',
        location: 'Seattle, WA',
        status: 'completed'
      }
    ]
  },
  {
    trackingCode: 'TRACK003',
    status: 'delivered',
    statusText: 'Delivered',
    eta: 'Yesterday, 1:15 PM',
    progress: 100,
    assignedCourier: 'Mike Davis',
    customerName: 'Sarah Connor',
    origin: {
      city: 'Miami, FL',
      code: 'MIA',
      date: 'Nov 22, 10:00 AM',
      coordinates: [25.7617, -80.1918]
    },
    destination: {
      city: 'Austin, TX',
      code: 'AUS',
      eta: 'Nov 24, 01:15 PM',
      coordinates: [30.2672, -97.7431]
    },
    currentLocation: {
      city: 'Austin, TX',
      status: 'Delivered',
      coordinates: [30.2672, -97.7431]
    },
    packageDetails: {
      weight: '5.0 kg',
      dimensions: '40x30x20 cm',
      service: 'Ground Delivery',
      courier: 'FastShip Express'
    },
    timeline: [
      {
        time: '01:15 PM',
        date: 'Yesterday',
        title: 'Delivered',
        location: 'Austin, TX',
        status: 'completed'
      }
    ]
  }
];

// Subscribe system for real-time React updates
type Listener = () => void;
const listeners = new Set<Listener>();

export const subscribeToUpdates = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

export const getAllDeliveries = (): TrackingData[] => {
  return [...mockTrackingData];
};

export const getTrackingData = (code: string): TrackingData | null => {
  return mockTrackingData.find(d => d.trackingCode === code) || null;
};

export const updateDeliveryStatus = (code: string, newStatus: TrackingData['status'], newStatusText: string, location: string) => {
  const index = mockTrackingData.findIndex(d => d.trackingCode === code);
  if (index !== -1) {
    const updatedDelivery = { ...mockTrackingData[index] };
    updatedDelivery.status = newStatus;
    updatedDelivery.statusText = newStatusText;
    updatedDelivery.currentLocation = { city: location, status: newStatusText, coordinates: updatedDelivery.currentLocation.coordinates };
    
    if (newStatus === 'delivered') updatedDelivery.progress = 100;
    else if (newStatus === 'out-for-delivery') updatedDelivery.progress = 90;
    
    updatedDelivery.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      title: newStatusText,
      location: location,
      status: 'completed'
    });

    mockTrackingData[index] = updatedDelivery;
    notifyListeners();
  }
};

export const updateCoordinates = (code: string, lat: number, lng: number) => {
  const index = mockTrackingData.findIndex(d => d.trackingCode === code);
  if (index !== -1) {
    mockTrackingData[index].currentLocation.coordinates = [lat, lng];
    notifyListeners();
  }
};
