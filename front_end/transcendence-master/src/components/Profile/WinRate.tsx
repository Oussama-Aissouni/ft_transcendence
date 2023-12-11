import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);
export default function WinRate(props:any) {
  
  const data = {
    labels: [],
    datasets: [
      {
        label: "games",
        data: [props.wins, props.losses],
        backgroundColor: ["#6F37CF", "#EB5E5E"],

        borderWidth: 0,
        cutout: "80%",
        borderRadius: 50,
      },
    ],
  };

  const textCenter = {
    id: "textCenter",
    beforeDatasetDraw(chart: any) {
      const { ctx } = chart;

      ctx.save();
      ctx.font = "15px sans-serif";
      ctx.fillStyle = "#8F8F8F";
      ctx.textAlign = "center";
      ctx.fillText(
        `Winrate`,
        chart.getDatasetMeta(0).data[0].x,
        chart.getDatasetMeta(0).data[0].y - 10
      );
      ctx.fillText(
        `${(isNaN((props.wins / (props.wins + props.losses))) ? 0 : (props.wins / (props.wins + props.losses)) * 100).toFixed(2)} %`,
        chart.getDatasetMeta(0).data[0].x,
        chart.getDatasetMeta(0).data[0].y + 10
      );
    },
  };
  
  return (
    <>
      <div className="w-[120px] h-[120px]">
        <Doughnut data={data} plugins={[textCenter]} />
      </div>
      <div className="flex xl:m-[30px] w-[50%] justify-evenly">
        <div className="flex w-[110px] h-fit ">
          <div className="w-[5px] h-[35px] bg-[#6F37CF]"></div>
          <div className={`bg-gradient-to-r from-[rgba(111,55,207,0.2)] flex w-full items-center justify-center text-${props.color}`}>
            {props.wins} wins
          </div>
        </div>
        <div className="flex w-[110px] h-fit ">
          <div className="w-[5px] h-[35px] bg-[#EB5E5E]"></div>
          <div className={`bg-gradient-to-r from-[rgba(235,94,94,0.2)]  flex w-full items-center justify-center text-${props.color}`}>
            {props.losses} losses
          </div>
        </div>
      </div>
    </>
  );
}
