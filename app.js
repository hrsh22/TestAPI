require("dotenv").config();
var ethers = require("ethers");
const express = require("express");
const app = express();
const connectDB = require("./db/connect");
const Product = require("./models/product");

const PORT = process.env.PORT || 5000;

const products_router = require("./routes/products");

const uri= process.env.MONGODB_URL;

const IERC721_ABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "approved",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "ApprovalForAll",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "balance",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getApproved",
      outputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
      ],
      name: "isApprovedForAll",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ownerOf",
      outputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "setApprovalForAll",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4",
        },
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  var collectionJSON = [];

  let provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/filecoin_testnet"
  );

  async function getERC721CollectionsPart2(blockNumber) {
    try {
      // await connectDB(process.env.MONGODB_URL);
  
      let provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.ankr.com/filecoin_testnet"
      );
      var collectedAddresses = [];
      console.log("\nSearching...");
  
      let block;
  
        //get block and transactions from blocknumber
        try {
          block = await provider.getBlockWithTransactions(Number(blockNumber));
          console.log(`Block ${blockNumber}_>`);
        } catch (err) {
  console.log(err);
        }
  
        //scan each transaction in block
        for await (const transaction of block.transactions) {
          //check if any smart contract created with this transaction
          if (transaction?.creates !== null) {
            //check if created smart contract is ERC721 or not
            try {
              const contract = new ethers.Contract(
                transaction?.creates,
                IERC721_ABI,
                provider
              );
              const isERC721 = await contract.supportsInterface("0x80ac58cd");
              if (isERC721) {
                collectedAddresses.push(transaction?.creates);
                  
                collectionJSON = {
                  ...collectionJSON,
                  ...{ block: blockNumber, contractAddress: transaction?.creates },
                };
                console.log(collectionJSON);
                // await Product.deleteMany();
                await connectDB(process.env.MONGODB_URL);
                const creating = await Product.create(collectionJSON);
                console.log(creating);
                console.log("Data imported successfully");
                console.log(collectionJSON);
  
                // ERC721Collections.push(transaction?.creates);
              } else {
                continue;
              }
            } catch (_) {
              continue;
            }
          }
        }
  
        //print result on console
        if (collectedAddresses.length > 0) {
          console.log(`For block ${blockNumber}: `, collectedAddresses);
          collectedAddresses = [];
          console.log("\nSearching...");
        }
      
    } catch (err) {
      console.log(err);
    }
  }

app.get("/", (req,res)=>{
    res.send("Hi i am live!");
});

// set router

app.use("/api/products",products_router);

const start = async ()=>{
    try{
        await connectDB(uri);
        app.listen(PORT, ()=>{
            console.log("Server is live!");
            console.log(`${PORT} is the magic port!`);
        });
        provider.on("block", (blockNumber) => {
            // Emitted on every block change
            getERC721CollectionsPart2(blockNumber);
            console.log(blockNumber);
          });
    } catch (err){
        console.log(err);
    }
}

start();