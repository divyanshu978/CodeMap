package main

import "fmt"

func main() {
	fmt.Println("printing is important")
	// conditionals! if else wgera!
	age := 18
	if age >= 18 {
		fmt.Println("Eligible to Vote")
	} else if age < 16 || age > 56 {
		fmt.Println("Ineligible to Vote")
	} else {
		fmt.Println("Nothing we have!")
	}
}
