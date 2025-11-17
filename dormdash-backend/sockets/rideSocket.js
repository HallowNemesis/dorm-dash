import pool from '../db.js';

const activeDrivers = new Map(); // driverId -> {socketId, lat, lng, isAvailable}
const activeRiders = new Map();  // riderId -> {socketId, currentRideId}

// Simple method for real-time storage, can be replaced with firebase storage in future
function getDistance(lat1, lon1, lat2, lon2) {
    return (Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111000); // in meters
}

export function registerRideSocketHandlers(io, socket) {

    socket.on("registerUser", ({ userId, role }) => {
        if (role === "driver") {
            activeDrivers.set(userId, { socketId: socket.id, lat: null, lng: null, isAvailable: false });
            console.log(`Driver registered: ${userId}`);
        } else if (role === "rider") {
            activeRiders.set(userId, { socketId: socket.id, currentRideId: null });
            console.log(`Rider registered: ${userId}`);
        }
    });

    socket.on("driverStatusUpdate", ({ userId, lat, lng, isAvailable }) => {
        const driver = activeDrivers.get(userId);
        if (!driver) return;

        d.lat = lat;
        d.lng = lng;
        d.isAvailable = isAvailable;

    });

    socket.on("requestRide", async ({ data }) => {
        try {
            const [results] = await pool.execute(
                'INSERT INTO rides_requests (rider_id, pickup_lat, pickup_lng, dest_lat, dest_lng, status) VALUES (?, ?, ?, ?, ?)',
                [data.riderId, data.pickup_lat, data.pickup_lng, data.dest_lat, data.dest_lng]
            );

            const rideId = results.insertId;
            console.log(`Ride requested: ${rideId} by rider ${data.riderId}`);

            const rider = activeRiders.get(data.riderId);
            if (rider) rider.currentRideId = rideId;

            //Match with nearest available driver 
            let bestDriver = null;
            let bestDist = Infinity;

            for (const [driverId, info] of activeDrivers.entries()) {
                if (!info.isAvailable || info.lat === null) continue;

                const d = dist2(info.lat, info.lng, data.pickup_lat, data.pickup_lng);
                if (d < bestDist) {
                    bestDist = d;
                    bestDriver = { driverId, info };
                }
            }

            if (!bestDriver) {
                io.to(rider.socketId).emit("noDriversAvailable");
                return;
            }

            await pool.query(
                `UPDATE ride_requests 
         SET matched_driver_id=?, status='matched'
         WHERE id=?`,
                [bestDriver.driverId, rideId]
            );

            io.to(rider.socketId).emit("matchFound", {
                rideId,
                driverId: bestDriver.driverId,
            });

            io.to(bestDriver.info.socketId).emit("newRideAssigned", {
                rideId,
                riderId: data.riderId,
                ...data,
            });

        } catch (err) {
            console.error(err);
            socket.emit("rideRequestError");
        }
    });

    socket.on("acceptRide", async ({ rideId, driverId }) => {
        await pool.query(
            "UPDATE ride_requests SET status='driver_en_route' WHERE id=?",
            [rideId]
        );

        for (const [rid, info] of activeRiders.entries()) {
            if (info.currentRideId === rideId) {
                io.to(info.socketId).emit("rideAccepted", { rideId, driverId });
            }
        }
    });
    socket.on("driverLocation", ({ driverId, lat, lng, rideId }) => {
        for (const [rid, info] of activeRiders.entries()) {
            if (info.currentRideId === rideId) {
                io.to(info.socketId).emit("updateDriverLocation", { lat, lng });
            }
        }
    });
    socket.on("chatMessage", (msg) => {
        io.emit("newChatMessage", msg);
    });
    socket.on("disconnect", () => {
        for (const [id, info] of activeDrivers) {
            if (info.socketId === socket.id) activeDrivers.delete(id);
        }
        for (const [id, info] of activeRiders) {
            if (info.socketId === socket.id) activeRiders.delete(id);
        }
    });
}