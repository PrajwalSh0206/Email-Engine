import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CONSTANTS from "../../constants";
import sockets from "../../sockets";
import Toast from "../../components/Toast";
import Loader from "../../components/Loader";

const Mail = () => {
  let { provider } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mail, setMail] = useState({});
  const [batches, setBatches] = useState();
  const [index, setIndex] = useState(0);
  const email = searchParams.get("email");
  const userId = searchParams.get("user_id");
  const [socket, setSocket] = useState();
  const [popUp, setPopUp] = useState();
  const [popUpMessage, setPopUpMessage] = useState();
  const [loading, setLoading] = useState(true);

  const handleMessage = async (newIndex) => {
    try {
      const email = searchParams.get("email");
      const userId = searchParams.get("user_id");
      const response = await axios({
        method: "POST",
        url: `${CONSTANTS.BACKEND_URL}/mail/${provider}`,
        data: {
          email,
          index: newIndex,
          userId,
        },
        withCredentials: true,
      });
      const { messages, batch } = response.data;
      setMail(messages);
      setBatches(batch);
      if (!socket) {
        handleSocket(handleEvents);
      }
      setLoading(false);
    } catch (error) {
      navigate("/");
    }
  };

  const handleEvents = (type, data) => {
    switch (type) {
      case "updateEmail": {
        const { messageId, flag } = data;
        setPopUpMessage(`Updating Mail Id ${messageId} With Flag ${flag}`);
        setMail((prevMail) => {
          const currentMails = prevMail || {};
          setPopUp(true);
          if (currentMails[messageId]) {
            return {
              ...currentMails,
              [messageId]: { ...currentMails[messageId], flag },
            };
          } else {
            return currentMails;
          }
        });

        break;
      }
    }
  };

  const handleSocket = (callback) => {
    const socket = sockets(provider, email, userId);
    socket.connect();
    setSocket(socket);

    socket.on("connect", () => {
      console.log(socket.connected); // true
    });

    socket.on("updateEmail", (message) => {
      console.log(message);
      callback("updateEmail", message);
    });
  };

  useEffect(() => {
    handleMessage(0);
    return () => {
      if (socket) {
        socket.disconnect(); // Close connection on unmount
      }
    };
  }, []);

  const handlePagination = (type) => {
    let prev = index;
    let newIndex = index;
    switch (type) {
      case "dec":
        newIndex = Math.max(index - 1, 0);
        break;
      default:
        newIndex = Math.min(index + 1, batches - 1);
        break;
    }
    setIndex(newIndex);
    if (prev != newIndex) {
      setLoading(true);
      console.log(newIndex);
      handleMessage(newIndex);
    }
  };
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full h-full p-5 bg-gray-200">
      {popUp && (
        <Toast
          message={popUpMessage}
          onClose={() => {
            setPopUp(false);
          }}
        ></Toast>
      )}

      <div className="rounded-md bg-white border-2 border-gray-500 p-3 flex flex-col items-end space-y-5">
        <table className="w-full text-left">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="p-2 w-1/12">UID</th>
              <th className="p-2 w-2/12">Sender</th>
              <th className="p-2 w-2/12">Subject</th>
              <th className="p-2 w-1/12">Flag</th>
              <th className="p-2 w-2/12">Date</th>
              <th className="p-2 w-2/12">Time</th>
              <th className="p-2 w-2/12">View</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(mail).map((value) => (
              <tr key={mail[value].messageId} className="even:bg-gray-200">
                <td className="p-4">{mail[value].messageId}</td>
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
