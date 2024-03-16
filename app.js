import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

var num, name;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

io.on('connection', (socket) => {
    socket.on("join-room", room => {
        socket.join(room);
        const roomL = io.sockets.adapter.rooms.get(room);
        num = roomL.size;
        if(num === 1){
            name = socket.id;
        }  
        io.to(room).emit("checkSize", num, name);
    });

    socket.on("clicked", (idName, room) => {
        var current = socket.id;
        io.to(room).emit("performTask", idName, current);
    }); 
    
    socket.on("restrtfunc", (room) => {
        io.to(room).emit("re-game", room);
    });

    socket.on('disconnect', () => {
        const room = socket.rooms.values().next().value;
        socket.leave(room);
    });
});

app.get("/", (req,res) => {
    res.render("home.ejs");
});

app.post("/room", (req,res) => {
    var inputRoom = req.body.room;
    res.render("index.ejs", {
        inputRoom : inputRoom
    });
});

server.listen(port, () => {
    console.log(`Server running ${port}`);
  });
  