import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode, language }) => {
  return (
    <Editor
      height="100%"
      theme="vs-dark"
      language={language === "javascript" ? "javascript" : language}
      value={code}
      onChange={(value) => setCode(value)}
      
    />
  );
};

export default CodeEditor;