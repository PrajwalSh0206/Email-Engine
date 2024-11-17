import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CONSTANTS from "../constants";

const Mail = () => {
  let { providers } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleApiCall = async () => {
    try {
      const access_token = searchParams.get("access_token");
      console.log(access_token);
      const config = {
        method: "POST",
        url: `${CONSTANTS.BACKEND_URL}/mail/${providers}`,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      };
      const response = await axios(config);
      console.log(response);
    } catch (error) {
      navigate("/");
    }
  };

  useEffect(() => {
    handleApiCall();
  }, []);

  return (
    <div className="w-full h-full p-5 bg-gray-200">
      <div className="rounded-md bg-white border-2 border-gray-500 p-3">
        <table className="table-auto w-full text-left">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="p-2 w-1/12">Id</th>
              <th className="p-2 w-3/12">Sender</th>
              <th className="p-2 w-3/12">Subject</th>
              <th className="p-2 w-3/12">Date</th>
              <th className="p-2 w-1/12">View</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-1">1</td>
              <td className="p-1">Malcolm Lockyer</td>
              <td className="p-1">The Sliding Mr. Bones (Next Stop, Pottersville)</td>
              <td className="p-1">1961</td>
              <td className="p-1">
                <button className="transition-transform transform active:scale-95 rounded-full p-2 bg-gray-200 border-2 border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Mail;
