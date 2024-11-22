import { useEffect, useState } from "react";
import { Link, Outlet, useParams, useSearchParams } from "react-router-dom";

const Dashboard = () => {
  let { provider } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const email = searchParams.get("email");
  const userId = searchParams.get("user_id");
  const [isActive, setIsActive] = useState("inbox");

  const handleClick = (name) => {
    setIsActive(name);
  };

  return (
    <div className="w-full h-full flex bg-gray-200 space-x-5 p-3">
      <div className="w-3/12 h-full flex flex-col space-y-3 bg-white rounded-md relative p-5 border-2 border-gray-500">
        <Link
          className={`flex space-x-2 items-center p-3 border-2 border-gray-500 rounded-md ${isActive == "inbox" ? "bg-gray-500 text-white " : "bg-gray-200"}`}
          to={`/mail/${provider}/inbox?email=${email}&user_id=${userId}`}
          onClick={() => {
            handleClick("inbox");
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3"
            />
          </svg>

          <p>Inbox</p>
        </Link>
        <Link
          className={`flex space-x-2 items-center p-3 border-2 border-gray-500 rounded-md ${isActive == "deleted" ? "bg-gray-500 text-white " : "bg-gray-200"}`}
          to={`/mail/${provider}/deleted?email=${email}&user_id=${userId}`}
          onClick={() => {
            handleClick("deleted");
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>

          <p>Deleted</p>
        </Link>
        <Link
          className={`flex space-x-2 items-center p-3 border-2 border-gray-500 rounded-md ${isActive == "sent" ? "bg-gray-500 text-white" : "bg-gray-200"}`}
          to={`/mail/${provider}/sent?email=${email}&user_id=${userId}`}
          onClick={() => {
            handleClick("sent");
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>

          <p>Sent</p>
        </Link>
      </div>
      <div className="w-9/12 h-full overflow-y-scroll">
        <Outlet></Outlet>
      </div>
    </div>
  );
};

export default Dashboard;
