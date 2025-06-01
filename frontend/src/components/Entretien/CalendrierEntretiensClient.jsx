import React, { useEffect, useState } from "react";
import ApiService from "../../Api/Api";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import toast from "react-hot-toast";

const statusColors = {
  planifie: "#3b82f6",
  en_cours: "#facc15",
  termine: "#22c55e",
  annule: "#ef4444",
};

const CalendrierEntretiensClient = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await ApiService.getEntretienCalendarClient();

        const raw = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.results)
          ? res.data.results
          : [];

        const formatted = raw.map((e) => ({
          id: e.id,
          title: e.title,
          start: new Date(e.start).toISOString(),  
          end: new Date(e.end).toISOString(),
          backgroundColor: statusColors[e.status] || "#60a5fa",
          borderColor: "transparent",
          textColor: "#fff",
          classNames: ["fc-google-event"],
          extendedProps: {
            statut: e.status,
            installation_id: e.installation_id,
          },
        }));

        setEvents(formatted);
      } catch (err) {
        console.error("Erreur chargement calendrier client :", err);
        toast.error("❌ Erreur chargement du calendrier");
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="max-w-[95%] mx-auto pt-6">
      <div className="rounded-lg bg-white shadow border border-gray-200 p-4">
        <div className="flex justify-center " style={{ marginBottom: '50px' }}>
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            📅 Mon calendrier d’entretiens
          </h2>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale={frLocale}
          events={events}
          height="auto"
          dayMaxEventRows={3}
          eventDisplay="block"
          eventClick={(info) => {
            const entretienId = info.event.id;
            window.location.href = `/client/entretiens/${entretienId}`;
          }}
          eventMouseEnter={(info) => {
            const tooltip = document.createElement("div");
            tooltip.innerHTML = `
              <div style="font-weight: 600;color: #444; margin-bottom: 4px;">${info.event.title}</div>
              <div style="font-size: 0.85rem; color: #444;">Statut : ${info.event.extendedProps.statut}</div>`;
            tooltip.style.position = "absolute";
            tooltip.style.zIndex = "1000";
            tooltip.style.background = "#fff";
            tooltip.style.border = "1px solid #ccc";
            tooltip.style.padding = "6px 10px";
            tooltip.style.borderRadius = "6px";
            tooltip.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
            tooltip.style.pointerEvents = "none";
            tooltip.id = "event-tooltip";
            document.body.appendChild(tooltip);
            info.el.addEventListener("mousemove", (e) => {
              tooltip.style.top = e.pageY + 15 + "px";
              tooltip.style.left = e.pageX + 15 + "px";
            });
          }}
          eventMouseLeave={() => {
            const tooltip = document.getElementById("event-tooltip");
            if (tooltip) tooltip.remove();
          }}
        />
      </div>

      <style>{`
        .fc .fc-button {
          background-color: #1a73e8;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-weight: 500;
        }
        .fc .fc-button:hover {
          background-color: #1765c1;
        }
        .fc .fc-button-primary:disabled {
          background-color: #cbd5e1;
        }
        .fc .fc-event.fc-google-event {
          border-radius: 4px;
          font-size: 0.9rem;
          padding: 2px 4px;
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }
        .fc .fc-daygrid-event-dot {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CalendrierEntretiensClient;
