import { useState } from "react";
import errorImage from "../assets/image/404-page-not-found-1-15.svg";

const Error = () => {
  const [error, setError] = useState("Something Went Wrong");

  return (
    <div className="w-screen h-screen flex flex-col items-center space-y-2 justify-center">
      <img src={errorImage} className="w-4/12"></img>
      <a href="/" className="p-4 border-2 rounded-md border-indigo-800 text-indigo-800 border-b-8">
        Redirect Home
      </a>
    </div>
  );
};

module.exports = { Error };
