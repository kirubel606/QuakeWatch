import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const EarthquakeMap = () => {
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [eventType, setEventType] = useState('earthquake');
  const [zoomLevel, setZoomLevel] = useState(3);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  // Fetch data based on the selected event type and date
  useEffect(() => {
    const startDate = selectedDate + 'T00:00:00'; // Start of the day
    const endDate = selectedDate + 'T23:59:59'; // End of the day
    axios
      .get('https://earthquake.usgs.gov/fdsnws/event/1/query', {
        params: {
          format: 'geojson',
          eventtype: eventType,
          starttime: startDate,  // Add start time for the query
          endtime: endDate,      // Add end time for the query
          limit: 100,             // Fetch the 10 most recent events for that day
        },
      })
      .then((response) => {
        setEarthquakeData(response.data.features);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [eventType, selectedDate]);  // Re-run the fetch when eventType or selectedDate changes

  // Transform earthquake data for markers
  const markers = earthquakeData.map((event) => ({
    id: event.id,
    title: `Magnitude: ${event.properties.mag}, Location: ${event.properties.place}`,
    position: { lat: event.geometry.coordinates[1], lng: event.geometry.coordinates[0] },
  }));

  const mapContainerStyle = {
    width: '100%',
    height: 'calc(100vh - 120px)',
  };

  const center = { lat: 0, lng: 20 };
  const redDotIcon = {
    url: '/redDot.gif',  // Path to your GIF in the public folder
    scaledSize: { width: 32, height: 32 },  // Adjust size if needed
  };

  const mapOptions = {
    mapTypeId: 'satellite', // Set to 'satellite' to display satellite view
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [
          { visibility: 'on' }, // Ensure labels are visible
        ],
      },
    ],
    // You can also force the map to stay in satellite mode with labels here
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navigation Bar Style for Dropdowns */}
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <div className="flex space-x-4">
          {/* Dropdown to select event type */}
          <div>
            <label htmlFor="eventType" className="block">Select Event Type:</label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="p-2 bg-gray-700 text-white rounded"
            >
              <option value="earthquake">Earthquake</option>
              <option value="volcano">Volcano</option>
              <option value="tsunami">Tsunami</option>
            </select>
          </div>

          {/* Date Selector for filtering earthquakes */}
          <div>
            <label htmlFor="date" className="block">Select Date:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 bg-gray-700 text-white rounded"
            />
          </div>
        </div>
      </div>

      <LoadScript googleMapsApiKey="AIzaSyCCfjyxj72qr_Q48fZpBLQ0EL4uRk3QYeg">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoomLevel}
          mapTypeId="satellite" // Set default to satellite view
          options={mapOptions} // Pass in the options here
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.title}
              icon={redDotIcon}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default EarthquakeMap;
