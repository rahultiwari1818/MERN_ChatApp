import { createClient } from  'redis';


export const client =  createClient({
    username: 'default',
    password: process.env.REDIS_PASSWD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});


export const connectToRedis = async() =>{
    client.on("connect",()=>{
        console.log("connected to REDIS");
    })
    client.on("ready",()=>{
        console.log("Ready")
    })
    client.on("error",(err)=>{
        console.log(err,"redis")
    })
    await client.connect();

}

