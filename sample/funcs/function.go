package main

import "fmt"

// writing a function signature: it means defining a way function name is declared how the inputs or agrs are declared how output of the function is shown it is all about that
func sub(x int, y int) int {
	return x - y
}

// or we can declare it in more succinit way! func var(x,y int ) like this!
func subtract(f func(int, int) int, x, y int) int {
	return f(x, y)
}
func names()(string,string){
	return "John", "Doe"
}

// named return values:
func add() (x,y int){ //so you have name of the return values!
	return  5,6
}
func main() {

	fmt.Println("Learning functions")
	// functions are use to divide and make your code simpler increase readbility usability making much more modular so that it dont look messy all at once!
	fmt.Println(sub(6, 3))
	fmt.Println(sub(6, 4))
	fmt.Println(subtract(sub, 6, 5))
	// ignoring the return values: let say the return returns two values and we dont need one of them? then what wedo? we ignore it using underscore!
	x,_:= names() //here underscore was used to ignore second value "Doe"
	fmt.Println(x)

	// return the named values:
	a,b:= add()
	fmt.Println(a,b)

	// returning early or guard classes are both same thing!
	//  first of all it is: that dont go for nested and nested statements retunr early means retruing if you find the value not updating it with the variable and then affter returning it!
	// so guard classes is much easier to understand! 
	// it is - an early return from a function where a given condition is met!
}

