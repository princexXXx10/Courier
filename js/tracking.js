// ===================================
// TRACKING PAGE FUNCTIONALITY - HARDCODED MVP
// ===================================

document.addEventListener('DOMContentLoaded', function () {
  // HARDCODED DATA - MVP MODE
  // No API calls, no session storage dependency for critical rendering
  const hardcodedData = {
    trackingCode: 'TRACK001',
    status: 'in-transit',
    statusText: 'In Transit',
    eta: 'Today, 4:30 PM',
    progress: 65,
    origin: {
      city: 'New York, NY',
      code: 'NYC',
      date: 'Nov 24, 08:00 AM'
    },
    destination: {
      city: 'Los Angeles, CA',
      code: 'LAX',
      eta: 'Nov 26, 04:30 PM'
    },
    currentLocation: {
      city: 'Phoenix, AZ',
      status: 'Departed Facility'
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
  };

  // Initialize the page immediately with hardcoded data
  initializeTrackingPage(hardcodedData);
});

// ===================================
// Initialize Tracking Page
// ===================================
function initializeTrackingPage(data) {
  console.log("Initializing Tracking Page with Hardcoded Data", data);

  // Update status card
  updateStatusCard(data);

  // Update package details
  updatePackageDetails(data);

  // Update timeline
  updateTimeline(data);

  // Update visual map labels
  updateVisualMap(data);
}

// ===================================
// Update Visual Map
// ===================================
function updateVisualMap(data) {
  const mapOrigin = document.getElementById('mapOrigin');
  const mapCurrent = document.getElementById('mapCurrent');
  const mapDestination = document.getElementById('mapDestination');

  if (mapOrigin) mapOrigin.textContent = data.origin.city.split(',')[0];
  if (mapCurrent) mapCurrent.textContent = data.currentLocation.city.split(',')[0];
  if (mapDestination) mapDestination.textContent = data.destination.city.split(',')[0];
}

// ===================================
// Update Status Card
// ===================================
function updateStatusCard(data) {
  const statusCard = document.querySelector('.combined-status-card');
  const statusIconSvg = document.getElementById('statusIconSvg');
  const statusTitle = document.getElementById('statusTitle');
  const trackingCodeDisplay = document.getElementById('trackingCodeDisplay');
  const progressFill = document.getElementById('progressFill');
  const etaTime = document.getElementById('etaTime');

  if (!statusCard) return;

  // Set status class
  statusCard.className = `combined-status-card modern-card status-${data.status}`;

  // Update icon SVG based on status
  const iconPaths = {
    'in-transit': '<rect x="1" y="3" width="15" height="13"></rect><path d="M16 8V2l6 6-6 6v-4"></path>',
    'out-for-delivery': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    'delivered': '<polyline points="20 6 9 17 4 12"></polyline>',
    'delayed': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
  };

  if (statusIconSvg) {
    statusIconSvg.innerHTML = iconPaths[data.status] || iconPaths['in-transit'];
  }

  // Update text
  if (statusTitle) statusTitle.textContent = data.statusText;
  if (trackingCodeDisplay) trackingCodeDisplay.textContent = data.trackingCode;
  if (etaTime) etaTime.textContent = data.eta;

  // Animate progress bar
  if (progressFill) {
    setTimeout(() => {
      progressFill.style.width = data.progress + '%';
    }, 300);
  }
}

// ===================================
// Update Package Details
// ===================================
function updatePackageDetails(data) {
  const originCity = document.getElementById('originCity');
  const destinationCity = document.getElementById('destinationCity');
  const packageWeight = document.getElementById('packageWeight');
  const courierService = document.getElementById('courierService');

  if (originCity) originCity.textContent = data.origin.city;
  if (destinationCity) destinationCity.textContent = data.destination.city;
  if (packageWeight) packageWeight.textContent = data.packageDetails.weight;
  if (courierService) courierService.textContent = data.packageDetails.courier;
}

// ===================================
// Update Timeline
// ===================================
function updateTimeline(data) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  timeline.innerHTML = '';

  // Icon SVGs for different statuses
  const icons = {
    'Package Picked Up': '<path d="M20 7h-3a2 2 0 0 1-2-2V2"></path><path d="M9 18v-6"></path><path d="M15 18v-6"></path><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>',
    'Departed Facility': '<path d="M16 3h5v5"></path><path d="M21 3l-7 7"></path><path d="M8 3H3v5"></path><path d="M3 3l7 7"></path><path d="M8 21H3v-5"></path><path d="M3 21l7-7"></path><path d="M16 21h5v-5"></path><path d="M21 21l-7-7"></path>',
    'In Transit': '<rect x="1" y="3" width="15" height="13"></rect><path d="M16 8V2l6 6-6 6v-4"></path>',
    'Arrived at Facility': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    'Out for Delivery': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    'Delivered': '<polyline points="20 6 9 17 4 12"></polyline>'
  };

  data.timeline.forEach((item, index) => {
    const timelineItem = document.createElement('div');
    timelineItem.className = `timeline-item-minimal ${item.status}`;
    timelineItem.style.animationDelay = `${index * 0.1}s`;

    const iconSvg = icons[item.title] || icons['In Transit'];

    timelineItem.innerHTML = `
      <div class="timeline-icon-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${iconSvg}
        </svg>
      </div>
      <div class="timeline-content-minimal">
        <div class="timeline-time-minimal">${item.time}</div>
        <div class="timeline-title-minimal">${item.title}</div>
        <div class="timeline-location-minimal">${item.location}</div>
      </div>
    `;

    timeline.appendChild(timelineItem);
  });
}
