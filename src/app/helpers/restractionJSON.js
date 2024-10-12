export function restructureToJson(inputString) {
    try{
    // Remove the ```json and ``` markers
    const cleanedInput = inputString.replace(/```json|```/g, '').trim();
    
    // Parse the input string as JSON
    const inputObj = JSON.parse(cleanedInput);
    
    // Create the restructured object
    const restructuredObj = {
        gender: inputObj.gender || "",
        outfit: inputObj.description || ""
    };
    
    // Convert the restructured object to a JSON string
    return restructuredObj;
    } catch (error) {
      console.error("Error restructring JSON:", error);
      return {"outfit:": "",
        "gender": ""
      };
    }

  }


