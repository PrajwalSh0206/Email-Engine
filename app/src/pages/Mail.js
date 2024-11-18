import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CONSTANTS from "../constants";
import { io } from "socket.io-client";
import mailEvents from "../sockets/mailEvents";

const Mail = () => {
  let { provider } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mail, setMail] = useState({});
  const [batches, setBatches] = useState();
  const [index, setIndex] = useState(0);

  const handleMessage = async () => {
    try {
      const email = searchParams.get("email");

      const response = await axios({
        method: "POST",
        url: `${CONSTANTS.BACKEND_URL}/mail/${provider}`,
        data: {
          email,
          index,
        },
        withCredentials: true,
      });
      const { messages, batch } = response.data;
      setMail(messages);
      setBatches(batch);
      handleSocket(email);
    } catch (error) {
      navigate("/");
    }
  };

  const handlePagination = (type) => {
    let prev = index;
    let newIndex = index;
    switch (type) {
      case "dec":
        newIndex = Math.max(index - 1, 0);
        break;
      default:
        newIndex = Math.min(index + 1, batches);
        break;
    }
    setIndex(newIndex);
    if (prev != newIndex) {
      handleMessage();
    }
  };

  const handleSocket = async (email) => {
    try {
      const socket = io(CONSTANTS.BACKEND_URL, {
        auth: {
          provider,
          email,
        },
        withCredentials: true,
      });

      socket.connect();
      mailEvents(socket);
    } catch (error) {
      navigate("/");
    }
  };

  useEffect(() => {
    // handleApiCall();
    handleMessage();
  }, []);

  return (
    <div className="w-full h-full p-5 bg-gray-200">
      <div className="rounded-md bg-white border-2 border-gray-500 p-3 flex flex-col items-end space-y-5">
        <table className="w-full text-left">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="p-2 w-1/12">Id</th>
              <th className="p-2 w-2/12">Sender</th>
              <th className="p-2 w-2/12">Subject</th>
              <th className="p-2 w-1/12">Flag</th>
              <th className="p-2 w-2/12">Date</th>
              <th className="p-2 w-2/12">Time</th>
              <th className="p-2 w-2/12">View</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(mail).map((value, currentIndex) => (
              <tr key={mail[value].messageId} className="even:bg-gray-200">
                <td className="p-4">{currentIndex + 1}</td>
                <td className="p-4">{mail[value].from}</td>
                <td className="p-4">{mail[value].subject}</td>
                <td className="p-4">{mail[value].flag}</td>
                <td className="p-4">{mail[value].date}</td>
                <td className="p-4">{mail[value].time}</td>
                <td className="p-4">
                  <button className="transition-transform transform active:scale-95 rounded-full p-1 bg-gray-200 border-2 border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                      <path stroke-linecap="round" strokeLineJoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex space-x-3 items-center">
          <button
            className="bg-white border-2 active:bg-gray-100 border-gray-500 transition-transform active:scale-95 text-gray-800 p-3 rounded-md"
            onClick={() => handlePagination("dec")}
          >
            Previous
          </button>
          <p>{index + 1}</p>
          <p>-</p>
          <p>{batches}</p>
          <button className="bg-gray-800 transition-transform active:scale-95 text-white p-3 rounded-md" onClick={() => handlePagination("inc")}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mail;
