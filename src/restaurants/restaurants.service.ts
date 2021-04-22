import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants:Repository<Restaurant>,
        private readonly categories:CategoryRepository
    ){}

    async createRestaurant(
        owner:User,
        createRestaurantInput:CreateRestaurantInput
    ):Promise<CreateRestaurantOutput>{
        try{
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;
            const category = await this.categories.getOrCreate(
                createRestaurantInput.categoryName
            );
            newRestaurant.category = category;
            await this.restaurants.save(newRestaurant);
            return {
                ok:true
            };
        }catch{
            return {
                ok:false,
                error:"Could not create restaurant"
            };
        }
    }

    async editRestaurant(
        owner:User,
        editRestaurantInput:EditRestaurantInput
    ):Promise<EditRestaurantOutput>{
        return await this.performRequest(
            owner,
            [editRestaurantInput.restaurantId,{loadRelationIds:true}],
            "edit",
            editRestaurantInput,
        );
    }

    async deleteRestaurant(
        owner:User,
        {restaurantId}:DeleteRestaurantInput
    ):Promise<DeleteRestaurantOutput>{
        return await this.performRequest(
            owner,
            [restaurantId],
            "delete"
        );
    }

    async performRequest(
        owner:User,
        options:Object[],
        op:string,
        editRestaurantInput?:EditRestaurantInput
    ):Promise<CoreOutput>{
        try{
            const restaurant = await this.restaurants.findOne(...options);
            if(!restaurant){
                return {
                    ok:false,
                    error:"Restaurant not found"
                };
            }
            if(owner.id !== restaurant.ownerId){
                return {
                    ok:false,
                    error:`You can't ${op} a restaurant that you don't own`
                };
            }
            switch(op){
                case "edit":
                    let category:Category = null;
                    if(editRestaurantInput.categoryName){
                        category = await this.categories.getOrCreate(editRestaurantInput.categoryName);
                    }
                    await this.restaurants.save([{
                        id:editRestaurantInput.restaurantId,
                        ...editRestaurantInput,
                        ...(category && {category})
                    }]);
                    return {
                        ok:true
                    };
                case "delete":
                    await this.restaurants.delete(options[0]);
                    return {
                        ok:true
                    };
            }
        }catch{
            return {
                ok:false,
                error:`Could not ${op} restaurant.`
            };
        }
    }

    async allCategories():Promise<AllCategoriesOutput>{
        try{
            const categories = await this.categories.find();
            return {
                ok:true,
                categories
            }
        }catch{
            return {
                ok:false,
                error:"Could not load categories"
            };
        }
    }

    countRestaurants(category:Category){
        return this.restaurants.count({category});
    }

    async findCategoryBySlug({slug}:CategoryInput):Promise<CategoryOutput>{
        try{
            const category = await this.categories.findOne(
                {slug},
                {relations:["restaurants"]}
            );
            if(!category){
                return {
                    ok:false,
                    error:"Category not found"
                };
            }
            return {
                ok:true,
                category
            };
        }catch{
            return {
                ok:false,
                error:"Could not load category"
            };
        }
    }
}