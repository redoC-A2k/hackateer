const express = require("express");
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config()

router.post("/problem-statement",async (req,res)=>{
    const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
    });
    const openai = new OpenAIApi(configuration)
    console.log(process.env.OPENAI_KEY)
    const {statement,team_size,duration,team_members} = req.body
    if(!statement||!team_size||!duration||team_members.length<=0){
        return res.json({"error":"One of the field may be empty"})
    } else {
        // console.log(statement)
        // console.log(team_size)
        // console.log(duration)
        // console.log(team_members)
        let persons_str ;
        let persons = "";
        for (let i = 0; i < team_size; i++) {
            const member = team_members[i];
            let str = `( name : ${member.name}, skilled in : `
            for(let j=0; j<member.skills.length; j++){
                let skill = member.skills[j];
                if(j!=member.skills.length-1)
                str+=` ${skill},`
                else str+=`${skill}`
            };
            str+=`)`;
            if(i!=team_size-1)
            persons+=str+","
            else persons+=str;
        }
        if(team_size==1){
            persons_str=`That 1 person is`;
        } else {
            persons_str=`Those ${team_size} persons are`
        }
        let system = `Adopt the role of Software Engineering Mastermind , a master of all aspects of software engineering, from design and development to security and testing to documentation and delivery.
You are leading a team of ${team_size} skillful ${team_size==1?'individual':'individuals'} , all the work will be done by them , you will just lead them - ${persons_str} ${persons} `
        console.log(system)
        console.log('\n')

        let prompt = `I want you to provide solution for the hackathon which will be of ${duration==1?"1 day":duration+" days"} leading the skilled  ${team_size==1?'individual':'individuals'} , given below is problem  statement - 
"${statement}"

To do so, you will:
1. First, reason about how you will approach this. Generate at least three possible approaches and explain the pros and cons of each approach .
2. Then, ask yourself some questions to reflect on your approaches. For example: How feasible is each approach? How efficient is each approach? How creative is each approach? How can each approach be improved? Whether the individual have the minimum technical skill to complete that approach ? 
4 Next, evaluate your approaches based on your reflection. Assign a score to each approach from 1 to 10, where 10 is the best. Explain why you gave each score.
4. Finally, choose the best approach based on your evaluation and technical skills of the individuals . If individual lack the technical skill for all the three approaches , you must advice not to choose the given problem statement and choose a different one . 
5. For that choosen best approach , you will provide roadmap of the code to be done by each indivudual on each day based on their tech stack 

Do so in this format:
Approach #1: $approach1
Pros: $pros1
Cons: $cons1

Approach #2: $approach2
Pros: $pros2
Cons: $cons2

Approach #3: $approach3
Pros: $pros3
Cons: $cons3

Reflection: $reflection
Evaluation: $evaluation
Decision: $approach_number

Roadmap for the choosen project:
$Day1:
$individual1 name :
$overview of code

(and so on you will write for each individual and their overview of code to be done  on each day )`

        // console.log(prompt)
        try {
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {"role":"system","content":system},
                    {"role":"user","content":prompt}
                ],
                temperature: 1,
                max_tokens: 1900,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });
            console.log(response.data.choices[0].message)
        } catch (error) {
            console.log("error occured")
            if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
            } else {
            console.log(error.message);
            }
        }
    }

    res.json({
        "message":"It has been recieved"
    })
})

module.exports = router;