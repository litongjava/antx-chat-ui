import {Check, CirclePlay, Copy} from "lucide-react";
import {useState} from "react";

const CodeBlokTools = ({id, language}: { id: string, language: string }) => {
  // 修正状态变量和 setter 的命名
  const [copied, setCopied] = useState(false);
  const [runed, setRuned] = useState(false);

  const onCopy = async () => {
    try {
      const text = document.getElementById(id)!.innerText;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // 1 秒后恢复
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const onRun = async () => {
    try {
      const text = document.getElementById(id)!.innerText;
      console.log(language, text)
      setRuned(true);
      // 1 秒后恢复
      setTimeout(() => {
        setRuned(false);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={onCopy}>
        {copied
          ? <Check size={16}/>
          : <Copy size={16}/>
        }
        <span>Copy</span>
      </button>

      <button onClick={onRun}>
        {runed
          ? <Check size={16}/>
          : <CirclePlay size={16}/>
        }
        <span>Run</span>
      </button>

    </div>

  );
};

export default CodeBlokTools;
