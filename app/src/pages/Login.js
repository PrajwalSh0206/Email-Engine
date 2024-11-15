const { default: axios } = require("axios");

const Login = () => {
  const handleClick = async () => {
    try {
      const urlResponse = await axios.get("http://localhost:8000/auth/login/outlook");
      const { url } = urlResponse.data;
      console.log(url);
      window.location.href = url;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-gray-100 h-screen w-full flex items-center justify-center">
      <div className="w-6/12 lg:w-1/3 p-5 rounded-md flex flex-col justify-center">
        <button
          onClick={handleClick}
          className="p-3 space-x-3 flex items-center justify-center border-2 border-gray-900 transition-transform active:scale-95 active:bg-gray-100 bg-white text-gray-900 rounded-full border-b-4 active:border-b-2"
        >
          <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path
              d="M4 16.9865V7.01353C4 6.71792 4.21531 6.46636 4.50737 6.42072L19.3074 4.10822C19.6713 4.05137 20 4.33273 20 4.70103V19.299C20 19.6673 19.6713 19.9486 19.3074 19.8918L4.50737 17.5793C4.21531 17.5336 4 17.2821 4 16.9865Z"
              stroke="currentColor"
              stroke-width="1.5"
            ></path>
            <path d="M4 12H20" stroke="currentColor" stroke-width="1.5"></path>
            <path d="M10.5 5.5V18.5" stroke="currentColor" stroke-width="1.5"></path>
          </svg>
          <p>Sign In With Microsoft Account</p>
        </button>
      </div>
    </div>
  );
};

module.exports = { Login };
