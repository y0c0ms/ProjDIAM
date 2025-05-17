// Custom rendering for locations
const renderLocation = (locationId) => {
  const location = locations.find(loc => loc.id === locationId);
  return location ? location.name : "Fetching...";
};

// Handle price rendering
const renderPrices = () => {
  return (
    <div className="admin-section">
      <h2>Manage Prices</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Price</th>
            <th>Location</th>
            <th>Reported By</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((price) => {
            // Find location by ID
            const location = locations.find(loc => loc.id === price.location);
            const locationName = location ? location.name : `ID: ${price.location}`;
            
            return (
              <tr key={price.id}>
                <td>{price.id}</td>
                <td>{price.product_name}</td>
                <td>€{parseFloat(price.price).toFixed(2)}</td>
                <td>{locationName}</td>
                <td>{price.reported_by?.username || "Unknown"}</td>
                <td>{formatDate(price.date_reported)}</td>
                <td>
                  <button 
                    onClick={() => handleDelete("prices", price.id)} 
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 