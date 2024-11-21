import "../scss/Loader.css"

// Loader.js
const Loader = () => {
  return (
    <div className="loader">
      <div className="spinner"></div> {/* You can replace this with an actual spinner */}
      Loading...
    </div>
  );
};

export default Loader;