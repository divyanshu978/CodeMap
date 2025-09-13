package main

import "fmt"

func main() {

	fmt.Println("Lets learn Maps in Go:")

	mymap := make(map[string]int)
	mymap["adish"] = 5
	fmt.Println(mymap)
	// or
	mymap = map[string]int{
		"key":         50,
		"ashi(gappa)": 12,
	}
	fmt.Print(mymap)
}
