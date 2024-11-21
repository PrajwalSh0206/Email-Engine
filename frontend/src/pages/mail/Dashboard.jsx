import { useEffect } from "react";
import { Link, Outlet, useParams, useSearchParams } from "react-router-dom";

const Dashboard = () => {
  let { provider } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const email = searchParams.get("email");
  const userId = searchParams.get("user_id");

  return (
    <div className="w-full h-full flex bg-gray-200 space-x-5 p-3">
      <div className="w-3/12 h-full flex flex-col space-y-3 bg-white rounded-md relative p-5">
        <a className="bg-gray-200 p-3 active:bg-gray-400" href={`/mail/${provider}/inbox?email=${email}&user_id=${userId}`}>Inbox</a>
        <a className="bg-gray-200 p-3" href={`/mail/${provider}/deleted?email=${email}&user_id=${userId}`}>Deleted</a>
        <a className="bg-gray-200 p-3" href={`/mail/${provider}/sent?email=${email}&user_id=${userId}`}>Sent</a>

      </div>
      <div className="w-9/12 h-full overflow-y-scroll">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Dashboard;
