import React from "react";

const SidePanel = () => {
  const downloadTextFile = () => {
    const element = document.createElement("a");
    const file = new Blob(["Hello"], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `ticket_${new Date().toLocaleString()}.prn`;
    element.click();
  };

  return (
    <>
      <h1 className="text-5xl text-green-600">Side Panel</h1>
      <p>Hello World</p>
      <button onClick={downloadTextFile}>Download</button>
    </>
  );
};

export default SidePanel;
