package main

import "fmt"

func variadic(var_name ...int) (sum int) {
	for i := 0; i < len(var_name); i++ {
		sum += var_name[i]
	}
	return sum
}
func main() {

	fmt.Println("Heyo Lets learn Slices")
	// var arr_name [10]int
	// fmt.Println(len(arr_name))
	// for i := 0; i < 10; i++ {
	// 	arr_name[i] = i + 1
	// }
	// for i := 0; i < 10; i++ {
	// 	fmt.Print(arr_name[i], " ")
	// }
	// fmt.Print("\n")

	// slices which are dynamic arrays kind off!

	// slice_name := arr_name[:5]
	// for i := 0; i < 5; i++ {
	// 	fmt.Println(slice_name[i], " ")
	// }
	// make function / keyword
	// slicename := make([]DT,length,capacity!);
	myslice := make([]int, 5, 10) //cap is optional we can give or we can leave and also same goes with length!
	myslice = []int{1, 3, 4, 5, 5}
	for i := 0; i < 5; i++ {
		fmt.Printf("the value of my slice is:%d\n", myslice[i])
	}

	// variadic function: it is an function that lets you pass multiple args of same dt from 0  to anny number of args instead of passing slice if we want to pass slice thenwe need to use the spread operator
	fmt.Println(variadic(1, 2, 3, 4, 5))
	fmt.Println(variadic(myslice...))

	// append function:
	my_slice := make([]string, 5)
	my_slice = []string{"adish", "jain", "20", ""}
	my_slice = append(my_slice, "placed!-18LPA")
	for i := 0; i < len(my_slice); i++ {
		fmt.Printf("the value now is using append: %s\n", my_slice[i])
	}

	// range function: mostly similar to what we have in python!
	for _, element := range myslice { // _ underscore is used to ignore the variable at that place it is necessary but if we need to ignore we can use underscore!
		fmt.Printf("%d ", element)
	}
}


