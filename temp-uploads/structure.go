package main

import "fmt"

// strcuts are basically a way of defining your own customized datatype
type Information struct {
	Name       string
	age        int
	university iiitbhopal
}

// i also showed you the example of nested structs!
type iiitbhopal struct {
	location     string
	opening_Date int
}
type car struct {
	make  string
	model string
}
type Embedded struct {
	wheelsize int
	car       // its just we called an struct here now it is embedded we can access the variables directly
	// like Embedded.make or .model like this we can do this easily!!!
}

func main() {
	info := Information{} //an empty struct is defined and the variables inside it is accesed using . operator
	info.Name = "Adish"
	info.age = 22
	info.university.location = "NTB"
	info.university.opening_Date = 2017
	//we can also define an anyonomous struct!and it is mostly defined int the case
	// when the struct needs to be defined only for one variable:
	// mycar := struct {
	// 	Make  string
	// 	Model string
	// }{
	// 	Make:  "tesla",
	// 	Model: "v-3",
	// }
	// fmt.Println(mycar.Make, mycar.Model)

	// Embedded structs: these are basically use to remove the nested access of the variables!
	// for ex-:
	embed := Embedded{
		wheelsize: 12,
		car: car{
			make:  "tesla",
			model: "v3",
		},
	}
	fmt.Println(embed.make, embed.model, embed.wheelsize)
	// its just we called an struct here now it is embedded we can access the variables directly
	// like embed.make or .model like this we can do this easily!!!
	// instead of calling embed.car.make like we do in nested structs!

}

// methods in structs:
// func (variablenameforstruct struct-name) function_name() output/return dt{
//
// }
