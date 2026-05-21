import { useEffect, useState } from "react";
import {
  browserName,
  deviceType,
  osName,
} from "react-device-detect";

interface Activity {
  device: string;
  browser: string;
  os: string;
  time: string;
}

export default function LoginActivity() {

  const [activities, setActivities] =
    useState<Activity[]>([]);

  useEffect(() => {

    const newActivity = {
      device: deviceType || "Desktop",
      browser: browserName || "Unknown",
      os: osName || "Unknown",
      time: new Date().toLocaleString(),
    };

    // GET OLD DATA
    const existing =
      JSON.parse(
        localStorage.getItem("loginActivity") || "[]"
      );

    // ADD NEW LOGIN
    existing.unshift(newActivity);

    // SAVE
    localStorage.setItem(
      "loginActivity",
      JSON.stringify(existing)
    );

    setActivities(existing);

  }, []);

  return (
    <div className="space-y-4">

      <div className="
        bg-[#071426]
        border
        border-cyan-500/30
        rounded-xl
        p-5
      ">

        <h2 className="
          text-cyan-400
          text-xl
          font-bold
          mb-4
        ">
          Recent Login Events
        </h2>

        {
          activities.map((item, index) => (

            <div
              key={index}
              className="
              bg-[#0b1d35]
              rounded-lg
              p-4
              mb-3
              border
              border-cyan-500/20
            "
            >

              <p>
                <span className="text-cyan-400">
                  Device:
                </span>
                {" "}
                {item.device}
              </p>

              <p>
                <span className="text-cyan-400">
                  Browser:
                </span>
                {" "}
                {item.browser}
              </p>

              <p>
                <span className="text-cyan-400">
                  OS:
                </span>
                {" "}
                {item.os}
              </p>

              <p>
                <span className="text-cyan-400">
                  Login Time:
                </span>
                {" "}
                {item.time}
              </p>

            </div>
          ))
        }

      </div>
    </div>
  );
}