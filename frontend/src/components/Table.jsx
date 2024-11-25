const Table = ({ mailData = {}, folderName }) => {
  return (
    <div className="w-full flex flex-col bg-white rounded-md border-gray-500">
      <div className="pt-3 sticky top-0 bg-white">
        <div id="header" className="flex bg-gray-300 border-x-2 border-y-2 rounded-t-md border-gray-500">
          <div className="p-3 w-1/12">UID</div>
          <div className="p-3 w-3/12">Sender</div>
          <div className="p-3 w-3/12">Subject</div>
          <div className="p-3 w-1/12">Flag</div>
          <div className="p-3 w-2/12">Date</div>
          <div className="p-3 w-2/12">Time</div>
        </div>
      </div>
      <div id="body">
        {Object.keys(mailData).map(
          (key) =>
            mailData[key].folderName == folderName.toUpperCase() && (
              <div key={mailData[key].messageId} className="w-full flex p-2 last:border-b-0 border-b-2 border-x-2  border-gray-400 even:bg-gray-100">
                <div className="p-2 w-1/12">{mailData[key].messageId}</div>
                <div className="p-2 w-3/12 break-words">{mailData[key].from}</div>
                <div className="p-2 w-3/12 break-words">{mailData[key].subject}</div>
                <div className="p-2 w-1/12">{mailData[key].flag}</div>
                <div className="p-2 w-2/12">{mailData[key].date}</div>
                <div className="p-2 w-2/12">{mailData[key].time}</div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Table;
