var map = L.map("map").setView([coordinates[1], coordinates[0]], 9); // Set initial location and zoom

L.tileLayer(
  "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=IVIeAkxE40fwKtCy78mQ",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
).addTo(map);

var customIcon = L.icon({
  iconUrl:
    "https://static.vecteezy.com/system/resources/previews/022/222/003/non_2x/map-location-pin-icon-free-png.png", // Replace with your icon URL
  iconSize: [38, 38], // Size of the icon
  iconAnchor: [22, 94], // Point of the icon which will correspond to marker's location
  popupAnchor: [-8, -90], // Point from which the popup should open relative to the iconAnchor
});

var marker = L.marker([coordinates[1], coordinates[0]], {
  icon: customIcon,
}).addTo(map);
marker.bindPopup("Where You'll be?").openPopup();
