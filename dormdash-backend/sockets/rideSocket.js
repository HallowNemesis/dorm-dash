import pool from '../db.js';

const activeDrivers = new Map(); // driverId -> {socketId, lat, lng, isAvailable}
const activeRiders = new Map();  // riderId -> {socketId, currentRideId}
const activeRides = new Map();       // rideId -> {riderId, driverId, status, ...}

// Simple method for real-time storage, can be replaced with firebase storage in future
function getDistance(lat1, lon1, lat2, lon2) {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111000;
}

export function registerRideSocketHandlers(io, socket) {

    socket.on("registerUser", ({ userId, role }) => {
    if (role === "driver") {
      activeDrivers.set(userId, {
        socketId: socket.id,
        lat: null,
        lng: null,
        isAvailable: false,
      });
      console.log("Driver registered:", userId);
    } else if (role === "rider") {
      activeRiders.set(userId, {
        socketId: socket.id,
        currentRideId: null,
      });
      console.log("Rider registered:", userId);
    }
  });

    
  // Driver updates status
  socket.on("driverStatusUpdate", ({ userId, lat, lng, isAvailable }) => {
    const driver = activeDrivers.get(userId);
    if (!driver) return;

    driver.lat = lat;
    driver.lng = lng;
    driver.isAvailable = isAvailable;
  });

  // driver live location during ride
  socket.on("driverLocation", ({ driverId, lat, lng, rideId }) => {
    const ride = activeRides.get(rideId);
    if (!ride) return;

    const riderInfo = activeRiders.get(ride.riderId);
    if (riderInfo) {
      io.to(riderInfo.socketId).emit("updateDriverLocation", { lat, lng });
    }

    const driver = activeDrivers.get(driverId);
    if (driver) {
      driver.lat = lat;
      driver.lng = lng;
    }
  });

   // Rider requests ride
  socket.on("requestRide", async (data) => {
    try {
      const [results] = await pool.query(
        `INSERT INTO ride_requests 
           (rider_id, pickup_lat, pickup_lng, dest_lat, dest_lng)
         VALUES (?, ?, ?, ?, ?)`,
        [
          data.riderId,
          data.pickup_lat,
          data.pickup_lng,
          data.dest_lat,
          data.dest_lng,
        ]
      );

      const rideId = results.insertId;
      console.log("Ride requested:", rideId);

      const rider = activeRiders.get(data.riderId);
      if (rider) rider.currentRideId = rideId;

      // Match with nearest driver
      let bestDriver = null;
      let bestDistance = Infinity;

      for (const [driverId, info] of activeDrivers.entries()) {
        if (!info.isAvailable || info.lat === null) continue;

        const d = getDistance(
          info.lat,
          info.lng,
          data.pickup_lat,
          data.pickup_lng
        );

        if (d < bestDistance) {
          bestDistance = d;
          bestDriver = { driverId, info };
        }
      }

      if (!bestDriver) {
        if (rider) io.to(rider.socketId).emit("noDriversAvailable");
        return;
      }

      await pool.query(
        `UPDATE ride_requests 
         SET matched_driver_id=?, status='matched'
         WHERE id=?`,
        [bestDriver.driverId, rideId]
      );

      //track as active ride
      activeRides.set(rideId, {
        riderId: data.riderId,
        driverId: bestDriver.driverId,
        status: "matched",
      });

      // Notify rider
      if (rider) {
        io.to(rider.socketId).emit("matchFound", {
          rideId,
          driverId: bestDriver.driverId,
          status: "matched",
        });
      }

      // Notify driver
      io.to(bestDriver.info.socketId).emit("newRideAssigned", {
        rideId,
        riderId: data.riderId,
        ...data,
      });
    } catch (err) {
      console.error("requestRide error:", err);
      socket.emit("rideRequestError");
    }
  });

  // Driver accepts ride
  socket.on("acceptRide", async ({ rideId, driverId }) => {
    try {
      await pool.query(
        `UPDATE ride_requests SET status='driver_en_route' WHERE id=?`,
        [rideId]
      );

      const ride = activeRides.get(rideId);
      if (ride) ride.status = "driver_en_route";

      // Notify rider
      for (const [rid, info] of activeRiders.entries()) {
        if (info.currentRideId === rideId) {
          io.to(info.socketId).emit("rideAccepted", {
            rideId,
            driverId,
            status: "driver_en_route",
          });
        }
      }

    } catch (err) {
      console.error("acceptRide error:", err);
    }
  });


  // Driver arrived at pickup
  socket.on("driverArrived", ({ rideId }) => {
    const ride = activeRides.get(rideId);
    if (!ride) return;

    ride.status = "arrived_pickup";

    const riderInfo = activeRiders.get(ride.riderId);
    if (riderInfo) {
      io.to(riderInfo.socketId).emit("driverArrived", { rideId });
    }
  });

  //trip started
  socket.on("tripStarted", ({ rideId }) => {
    const ride = activeRides.get(rideId);
    if (!ride) return;

    ride.status = "trip_started";

    const riderInfo = activeRiders.get(ride.riderId);
    if (riderInfo) {
      io.to(riderInfo.socketId).emit("tripStarted", { rideId });
    }
  });

  // trip completed
  socket.on("tripCompleted", ({ rideId }) => {
    const ride = activeRides.get(rideId);
    if (!ride) return;

    ride.status = "trip_completed";

    const riderInfo = activeRiders.get(ride.riderId);
    if (riderInfo) {
      io.to(riderInfo.socketId).emit("tripCompleted", { rideId });
    }

    // Cleanup
    activeRides.delete(rideId);
  });


  // Chat message between rider and driver
  socket.on("chatMessage", (msg) => {
    io.emit("newChatMessage", msg);
  });

  socket.on("disconnect", () => {
    for (const [id, info] of activeDrivers.entries()) {
      if (info.socketId === socket.id) activeDrivers.delete(id);
    }
    for (const [id, info] of activeRiders.entries()) {
      if (info.socketId === socket.id) activeRiders.delete(id);
    }
  });
}