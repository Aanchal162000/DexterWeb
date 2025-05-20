const supportList = [
  {
    label: "Support Queries",
    para: "Reach us at ",
    link: "support@zkcross.network",
  },
  {
    label: "Partnership Queries",
    para: "Reach us at ",
    link: "partnerships@zkcross.network",
  },
  {
    label: "Human Resource Queries",
    para: "Reach us at ",
    link: "hr@zkcross.network",
  },
];

const SupportContacts = () => {
  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {supportList?.map((item, index) => (
        <div
          key={index}
          className="text-white flex flex-col gap-2 w-full sm:items-start items-center sm:justify-start justify-center"
        >
          <div className="font-medium sm:text-2xl text-lg text-primary-100">
            {item?.label}
          </div>
          <div className="sm:text-lg text-sm font-light">
            {item?.para}
            <a
              href={`mailto:${item?.link}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {item?.link}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupportContacts;
