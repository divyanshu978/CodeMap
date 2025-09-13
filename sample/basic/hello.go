package main 
// under this package main entire code is written!

import "fmt" //fmt package or format pckaage used for proper formatting! used for printing in go!

func main() {//main fucntion that contains the code whichis executed!   
    fmt.Println("Hello, Go!")

    // we can declare variables name in two ways:
    // 1. var name_of_variable datatype(int,int32,int64) like this!
    // 2. more easier way: variablename:= value!
    variables_name := "Happy birthday bestie"
    fmt.Println(variables_name)
    // now we will talk about all the way we can fmt package!
    // age:= 56
    // fmt.Print(age)
    // only print is used to print in singline!
    // fmt.println is used to print the statement and move the cursor to the next line!
    // in printf it does formatting like %s,%d,%v yeh sab use hota haii!

    // we can also declare variables ;like this:
    pi ,age:= 3.14,20
    // we also have %v- for all kind of verbs like - for everything string int all
    // and we also have %s,%f,%d
    fmt.Printf("the pi value is:%f, the age is:%d \n",pi,age)

    // typecasting can also be done if we want to in the same way it is done in c++
    // int/dataype(variable_name) to be typecasted!

    // we also have const dataype which cannot be declarede using short delcaration syntax!
    const name="Adish Jain"

    

}