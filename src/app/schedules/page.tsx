import Sidebar from "../../components/sidebar"
import ScheduleBox from "../../components/scheduleBox"

export default function SchedulesPage() {
  return (

 <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-slate-100 p-8 ml-72">
        <div className="flex flex-col bg-white p-8 shadow-xl rounded-xl gap-3">
          <div className="text-2xl font-bold">This Week</div>
           <div className="text-xl">See your exercise dates and times. Start, reschedule, or skip as needed.</div>
          <ScheduleBox 
          day={'MON'}
          date={4}
          month={'OCT'}
          title={'Workout Session 1'}
          status={'UPCOMING'}
          scheduledTime={'09.00-10.00'}
        />
          <ScheduleBox 
          day={'MON'}
          date={4}
          month={'OCT'}
          title={'Workout Session 1'}
          status={'UPCOMING'}
          scheduledTime={'09.00-10.00'}
        />
          <ScheduleBox 
          day={'MON'}
          date={4}
          month={'OCT'}
          title={'Workout Session 1'}
          status={'UPCOMING'}
          scheduledTime={'09.00-10.00'}
        />
          <ScheduleBox 
          day={'MON'}
          date={4}
          month={'OCT'}
          title={'Workout Session 1'}
          status={'UPCOMING'}
          scheduledTime={'09.00-10.00'}
        />
        </div>
      </main>
    </div>
  );
}