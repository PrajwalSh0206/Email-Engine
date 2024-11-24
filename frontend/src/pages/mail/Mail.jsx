import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CONSTANTS from "../../constants";
import sockets from "../../sockets";
import Toasts from "../../components/Toasts";
import Loader from "../../components/Loader";
import mailEvents from "../../sockets/mailEvents";
import Table from "../../components/Table";

const Mail = ({ folderName }) => {
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
      setLoading(true);
      const email = searchParams.get("email");
      const userId = searchParams.get("user_id");
      const response = await axios({
        method: "POST",
        url: `${CONSTANTS.BACKEND_URL}/mail/${provider}`,
        data: {
          email,
          folderName,
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
    const socket = sockets(provider, email, userId, folderName);
    socket.connect();
    setSocket(socket);

    socket.on("connect", () => {
      console.log(socket.connected); // true
    });

    mailEvents(socket, callback);
  };

  useEffect(() => {
    handleMessage(0);
    return () => {
      if (socket) {
        socket.disconnect(); // Close connection on unmount
      }
    };
  }, [folderName]);

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
  return (
    <div className="w-full h-full bg-white border-2 flex flex-col items-center space-y-3 rounded-md relative overflow-y-scroll border-gray-500">
      {popUp && (
        <Toasts
          message={popUpMessage}
          onClose={() => {
            setPopUp(false);
          }}
        ></Toasts>
      )}
      <div className="px-3 w-full">
        {loading ? <Loader></Loader> : <Table mailData={mail}></Table>}
        <div className="flex space-x-3 items-center sticky bottom-0 p-3 justify-end border-t-2 border-gray-500 bg-white w-full ">
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
