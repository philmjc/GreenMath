// File to insert courses objects into db
// These arrays are parsed im by the AI Service Module and converted by Controllers into DOM elements.
// What's the point? Much more efficient data transfer, data caching for off-line use and a more dynamic and responsive UI than
// compiling and transferring a template for each question.
// This can be efficiently cached by browser for off-line use.


function initCor() {
  db = db.getSiblingDB('cap');
  db.courses.drop();
  initCors.forEach(function(course) {
    db.courses.insert(course);
  });
  /*
  var bulk = db.courses.initializeUnorderedBulkOp();
  bulk.insert( initCors[0] );
  bulk.insert( initCors[1] );
  bulk.insert( initCors[2] );
  bulk.execute();
  */

}
var initCors = [
  {
    "name": "Eco Algebra for Juniors",
    "active" : true,
    "img" : "images/tree.svg",
    "cat": 1,
    "label": "Free",
    "price" : "Trial Mode",
    "descr" : "An engaging course for juniors. It teaches them to unleash" +
      "the power of algebra to save the planet.",
    content : [
      {
        envir : {
          bg : "fishmex-con"
        },
        qs : [
          {
            class : "bg-green1",
            templ : "Intro"
          }
        ]
      },
      {
        envir : {
          bg : "tree1-con",
          facs : [[10]],
          genL :  [
              ["T = ", [0,0,0] ],
              ["R = ", [0,0,1] ]
            ]
        },
        qs: [
          {
            class : "bg-green1",
            qt: "img",
            imgs : [
              {
                arr : [1,1,1,1,1],
                src : "images/tree1.svg",
                w : 40,
                h : 40,
                alt : "tree",
                class : "tree1"
              }
            ],
            genT :  [
              [" *** ENVIRONMENT ***"],
              ["A section of rainforest contains ", [0,0,0], " trees."],
              ["They are being cut down at the rate of ", [0,0,1], " per year."],
              ["Trees : ",[0,0,0], ". . . . . ( T = ", [0,0,0], " )"],
              ["Rate : ", [0,0,1], " / year. . ( R = ", [0,0,1], " )"]
            ]
          },
          {
            class : "bg-brown1",
            sub : true,
            lab : true,
            ans : true,
            qt : "txtInput",
            genA :
              [['*', 2, [0,0,1]]],
            genCheat :[
                ["Let's call: (Trees lost after n years) = TLn"],
                ["TLn = R x n"],
                ["TLn = ", [0,0,1], " x 2"],
                ["Answer: ", ['*', [0,0,1], 2]]
            ],
            txts: [
              "How many trees disappear after 2 years?",
              "Enter a number only - no letters"
            ],
            hs: [
              "Let's call: (Trees lost after n years) = TLn",
              "TLn = R x n"
            ],

          },
          {
            class : "bg-green2",
            sub : true,
            lab : true,
            ans : true,
            qt : "txtInput",
            genA : [['-', [0,0,0], ['*', 2, [0,0,1]]]],
            txts: [
              "How many trees are left after 2 years?",
              "Enter a number only - no letters"
            ],
            genCheat :  [
                ["(Trees lost after 2 years) = " , ['*',[0,0,1],2]],
                ["Let: (Trees left after 2 years) = T2"],
                ["T2 = T - " , ['*',[0,0,1],2]],
                ["Answer: " , ['-',[0,0,0] , ['*',[0,0,1],2]]]
              ],
            hs: [
              "You know how many trees were there to begin with",
              "You know how many trees have disappeared in 2 years",
              "How do you calculate how many are left?"
            ]
          },
          {
            class : "bg-brown2",
            lab : true,
            sub : false,
            ans : true,
            qt : "txtArea",
            qtR: 2,
            txts: [
              "Write an equation which describes what you just did",
              "e.g.",
              "Let: (Trees left after n years) = Tn",
              "Tn = ?"
            ],
            hs: [
              "Let: (Trees after n years) = Tn",
              "Tn = T - (R x n)"
            ]
          },
          {
            class : "bg-green3",
            lab : true,
            sub : false,
            ans : true,
            qt : "txtArea",
            qtR: 7,
            txts: [
              "We want to know in how many years will all the trees be gone.",
              "First re-arrange the equation so you can solve this."
            ],
            hs: [
              "Let: (Trees after n years) = Tn",
              "Tn = T - (R x n)",
              "Tn + (R x n) = T . . + (R x n) to both sides",
              "R x n = T - Tn . . . - Tn from both sides",
              "n = (T - Tn) / R . . / both sides by R"
            ]
          },
          {
            class : "bg-brown3",
            genA : [
              ['/',[0,0,0],[0,0,1]]  ,
            []],
            lab : true,
            sub : true,
            ans : true,
            qt : "txtInput",
            txts: [
              "Now solve: How many years will all the trees be gone?",
              "Enter a number only - no letters"
            ],
            hs: [
              "From above we know that after n years:",
              "n = (T - Tn) / R",
              "Do you know enough values to substitute and solve?"
            ],
            genCheat : [
                ["n = (T - Tn) / R "],
                ["All the trees have gone so Tn = 0"],
                ["n = (", [0,0,0], ' - 0) / ', [0,0,1]],
                ["Answer: " , ['/', ['-', [0,0,0], 0], [0,0,1]]]
              ],
          }
        ]
      },
      {
        envir : {
          bg : "tree-bird-con",
          facs : [[10,100]],
          genL : [
            ["T = " , [0,0,0]]
          ]
        },
        qs: [
          {
            class : "bg-green1",
            qt: "img",
            imgs : [
              {
                arr : [1,1,1,1,1,1,1],
                src : "images/tree1.svg",
                w : 40,
                h : 40,
                alt : "tree",
                class : "tree1"
              },
              {
                arr : [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                src : "images/birdp.svg",
                w : 20,
                h : 20,
                alt : "bird",
                class : "birdp"
              }
            ],
            imgb : [
              {
                alt : "bird",
                class : "birdp"
              }
            ],
            genT :
             [
              [" *** ENVIRONMENT ***"],
              ["Every forest is rich in bird life."],
              ["When trees are cut down, many birds are lost too."],
              ["3 years ago a section of forest contained ",[0,0,0]," trees."],
              [['*',[0,0,1],3]," were cut down in 3 years."],
              ["Scientists wanted to know how many birds were disappearing."],
              ["For a start they counted 220 birds living in 22 trees."],
              ["Trees : ",[0,0,0],". . . . . ( T = ",[0,0,0]," )"],
              ["Rate of Tree loss (Rt) : ",['*',3,[0,0,1]]," Trees / 3 years"],
              ["Birds / Tree : 220 / 22 "]
            ]
          },
          {
            class : "bg-brown1",
            sub : true,
            lab : true,
            ans : true,
            qt : "txtInput",
            genA : [
              [0,0,1],
              [ ["Rt = ",[0,0,1]] ]
            ],
            txts: [
              "Let: (Rate of trees lost) = Rt",
              "At what rate are trees lost per year?",
              "Enter a number only - no letters."
            ],
            hs: [
              "Rate means the NUMBER of trees lost every YEAR",
              "Let: (Rate of trees lost) = Rt",
              "Let: (Trees Lost after n years) = TLn",
              "Rt x n = TLn",
              "Rt = TLn / n . . . Divide both sides by n"
            ],
            genCheat : [
              ["Let: (Rate of trees lost) = Rt"],
              ["Let: (Trees Lost after n years) = TLn"],
              ["Rt = TLn / n"],
              ['Rt = ', ['*',[0,0,1],3], ' / 3' ],
              ['Answer: ', [0,0,1]]
            ]
          },
          {
            class : "bg-green2",
            lab : true,
            sub : true,
            ans : true,
            qt : "txtInput",
            genA : [
              [0,1,1],
              [ ["B = ",[0,1,0]], ["Rb = ",[0,1,1]] ]
            ],
            txts: [
              "Let: (Rate of birds lost per year) = Rb",
              "At what rate are birds lost per year?",
              "Enter a number only - no letters."
            ],
            hs: [
              "220 birds live in 22 trees.",
              "How many BIRDS per TREE?",
              "Rb  = Rt x (BIRDS / TREE)"
            ],
            genCheat : [
              ["Rb = Rt x (BIRDS / TREE)"],
              ["Rb = ", [0,0,1], ' * 10' ],
              ['Answer: ', ['*', [0,0,1], 10]]
            ],
            imgb : [
              {
                alt : "bird",
                class : "birdp"
              }
            ]
          },
          {
            class : "bg-brown2",
            lab : true,
            sub : false,
            ans : true,
            qt : "txtArea",
            qtR : 5,
            txts: [
              "We need to know how many birds are left 4 years from now?",
              "What steps are needed to work it out?"
            ],
            hs: [
              "Find the number of trees 3 years ago.",
              "Work out the number of birds there were.",
              "How many years between 3 years ago and 4 years from now?",
              "How many birds have been lost?",
              "How many are left.",
              ".",
              "(Birds / Tree) = 220 / 22",
              "Total Birds (B) = T x (220 / 22)",
              "Let: (Birds after n years) = Bn",
              "Bn = B - (Rb x n)"
            ],
            imgb : [
              {
                alt : "bird",
                class : "birdp"
              }
            ]
          },
          {
            class : "bg-green3",
            lab : true,
            ans : true,
            genA : [
              ['-',[0,1,0],['*',7,[0,1,1]] ]
            ],
            sub : true,
            qt : "txtInput",
            txts: [
              "Now calculate how many birds are left 4 years from now?",
              "Enter a number only - no letters."
            ],
            hs: [
              "Let: (Total number of Birds) = B",
              "Let: (Birds after n years) = Bn",
              "Bn = B - (Rb x n)"
            ],
            genCheat : [
              ["Let: (Total number of Birds) = B"],
              ["Let: (Birds after n years) = Bn"],
              ["Bn = B - (Br x n)"],
              ["Bn = ", [0,1,0], ' - (', [0,1,1], ' x 7)'],
              ['Answer: ', ['-',[0,1,0],['*',7,[0,1,1]] ]]
            ]
          },
          {
            class : "bg-brown3",
            lab : true,
            sub : false,
            ans : true,
            qt : "txtArea",
            qtR: 7,
            genT: [
              ["How many years from now will there only be ", [0,1,1], " birds left."],
              ["What steps are needed to work this out?"]
            ],
            hs: [
              "Let: (Total Birds) = B",
              "Let: (Birds after n years) = Bn",
              "Bn = B - (Rb X n)",
              "Bn + (Rb x n) = B . . . + (Rb x n) to both sides",
              "(Rb x n) = B - Bn . . . . - Bn from both sides",
              "n = (B - Bn) / Rb . . . / both sides by RATE",
              ".",
              "Remember: n is from 3 years ago!",
              "Answer: (n-3)"
            ],
            imgb : [
              {
                alt : "bird",
                class : "birdp"
              }
            ]
          },
          {
            class : "bg-green1",
            lab : true,
            sub : true,
            ans : true,
            qt : "txtInput",
            genT: [
              ["Now solve the above steps."],
              ["How many years from now will only ", [0,1,1], " birds be left?"],
              ["Enter a number only - no letters."]
            ],
            hs: [
              "Let: (Total Birds) = B",
              "Let: (Birds after n years) = Bn",
              "n = (B - Bn) / Rb",
              "Do you know enough values to substitute and solve?",
              ".",
              "Remember: n is from 3 years ago!",
              "Answer: (n-3)"
            ],
            genA : [
              ['-', ['/',['-',[0,1,0],[0,1,1]],[0,1,1]], 3]
            ],
            genCheat : [
              ["Let: (Total Birds) = B"],
              ["Let: (Birds after n years) = Bn"],
              ["n = (B - Bn) / Rb"],
              ["n = ( ", [0,1,0], ' - ', [0,1,1], ') / ', [0,1,1]],
              ["n = ", ['/',['-',[0,1,0],[0,1,1]],[0,1,1]]],
              ["Remember: n is from 3 years ago!"],
              ["Answer: (n-3) = ", ['-', ['/',['-',[0,1,0],[0,1,1]],[0,1,1]], 3]],
            ]
          }
        ]
      }
    ]
  },
  {
    "name": "Eco Algebra for Intermediate",
    "img" : "images/birdp.svg",
    "cat": 2,
    "price" : "Coming Soon!",
    "descr" : "Coming Soon For Evaluation! An engaging course for intermediates.",
    content : [],
    ans: []
  },
  {
    "name": "Eco Algebra for Advanced",
    "img" : "images/fishmex.svg",
    "cat": 3,
    "price" : "Coming Soon!",
    "descr" : "Coming Soon For Evaluation! An engaging course for seniors.",
    content : [],
    ans: []
  },
];
var extras = {
  problem : "A rain forest covers over 2500 Hectares. 500 Hectares have " +
  "already been cleared at the rate of 250 Hectares per year. How long " +
  "will it take for the forest to disappear completely?",
  prompt : "Transform the problem into an algebraic expression.",
  submit : "Now solve the expression and submit it.",
  answ : "4"
};
