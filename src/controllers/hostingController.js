const formidable = require('formidable')
const { Client } = require('pg');
const fs = require('fs');
const sharp = require('sharp');

// database connection
const conn = require("../../public/json/connection.json");
var client = new Client(conn);
client.connect();

const getHostDashboard = (req, res) =>{
    if(req.session && req.session.user){
        var queryGetProperties = `SELECT id_property, title FROM properties WHERE id_host=$1`;
        client.query(queryGetProperties, [req.session.user.id_user], (err, result) =>{
            if(err) console.log(err);
            else{
                var property;
                if(req.query && req.query.id_property) property = req.query.id_property;
                else if(result.rowCount > 0) property = result.rows[0].id_property;
                else return; // ERROR
            
                var queryGetConfirmedBookings = `SELECT b.* FROM bookings b JOIN users u USING(id_user) WHERE id_property=$1 AND b.status!='pending' AND b.checkin>CURRENT_DATE ORDER BY status`;
                client.query(queryGetConfirmedBookings, [property], (err1, result1) =>{
                    if(err1) {console.log(err1); return;}
                    var queryGetUnconfirmedBookings = `SELECT b.* FROM bookings b JOIN users u USING(id_user) WHERE id_property=$1 AND b.status='pending' AND b.checkin>=CURRENT_DATE`;
                    client.query(queryGetUnconfirmedBookings, [property], (err2, result2) =>{
                        if(err2) {console.log(err2); return;}
                        var queryGetCurrentBooking = `SELECT b.*, u.firstname, u.lastname, u.profile_pic FROM bookings b JOIN users u USING(id_user) WHERE id_property=$1 AND b.status='confirmed' AND b.checkin<=CURRENT_DATE AND checkout>CURRENT_DATE`;
                        client.query(queryGetCurrentBooking, [property], (err3, result3) =>{
                            if(err3) {console.log(err3); return;}
                            var queryGetPropertyDetails = `SELECT id_property, title, property_type, guests, rating, privacy, property_type, guests FROM properties WHERE id_property=$1`;
                            client.query(queryGetPropertyDetails, [property], (err4, result4) =>{
                                if(err4) {console.log(err4); return;}
                                var queryGetStats = `SELECT total_price, status, checkin FROM bookings WHERE checkin >= date_trunc('month', current_date) AND checkin < date_trunc('month', current_date + INTERVAL '1 month') AND id_property=$1`;
                                client.query(queryGetStats, [property], (err5, result5) =>{
                                    if(err5) { console.log(err5); return;}
                                    res.render('pages/hostDashboard', {
                                        properties: result.rows,
                                        confirmedBookings: result1.rows,
                                        unconfirmedBookings: result2.rows,
                                        currentBooking: result3.rows[0],
                                        currentProperty: result4.rows[0],
                                        numberOfProperties: result.rowCount,
                                        bookingsThisMonth: result5.rows
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
    }else{   // if not logged in
        res.render('pages/login',{path: (req.query.id_property ? `/hosting/?id_property=${req.query.id_property}` : '/hosting')});
    }
}

const getBecomeHost = (req, res) =>{
    if(req.session && req.session.user) res.render('pages/becomeHost')
    else{   // if not logged in
        res.render('pages/login',{path: '/hosting/becomeHost'});
    }
}

const postNewListing = (req, res) =>{
    if(req.session == null && req.session.user == null){
        res.send(403).render('pages/403');
        return;
    }
    var form = new formidable.IncomingForm();
    if(req.session.user){
    form.parse(req, (err, text_fields) =>{
        if(err) console.log(err);
        console.log(text_fields);

        // verify title isn't already used
        var queryVerifyUniqueTitle = `SELECT title FROM properties WHERE title = $1 and id_host = $2`;
        var paramsVerifyUniqueTitle = [text_fields.title, req.session.user.id_user];
        client.query(queryVerifyUniqueTitle, paramsVerifyUniqueTitle, (err, result) => {
            if(err) console.log(err);
            else{
                if(result.rows.length == 0){   // if no other listings are found with the same title
                    var queryAddProperty = `INSERT INTO properties (id_host, title, property_type, privacy) VALUES ($1, $2, $3, $4)`;
                    paramsAddProperty = [req.session.user.id_user, text_fields.title, text_fields.property_type, text_fields.privacy];

                    var queryUpdateRole = `UPDATE users SET role='host' WHERE id_user=$1`;
                    client.query(queryUpdateRole, [req.session.user.id_user], (err, result) =>{
                        if(err) { console.log(err); return;}
                        req.session.user.role = 'host';
                    });

                    client.query(queryAddProperty, paramsAddProperty, (err1, result1) =>{
                        if(err1){
                            console.log(err1);
                            // error handling
                        }
                        else{
                            var queryGetPropertyId = `SELECT id_property FROM properties WHERE title = $1 AND id_host = $2 `;
                            var paramsGetPropertyId = [text_fields.title, req.session.user.id_user];
                            client.query(queryGetPropertyId, paramsGetPropertyId, (err2, result2) => {
                                if(err2){
                                    console.log(err2);
                                    // error handling
                                }
                                else{
                                    res.render('pages/listingAddress', {id_property: result2.rows[0].id_property})
                                }
                            });
                        }
                    });
                }   // else TODO: show error: title already used
            }
        });
    });
    } // else TODO: show error: need to be logged in
}

const getListingAddress = (req, res) =>{
    if(req.session && req.session.user){
    queryGetAddress = `SELECT * FROM address WHERE id_property= $1`;
    client.query(queryGetAddress, [req.params.id_property], (err, result) =>{
        if(err) console.log(err);
        else{
            if(result.rows[0])
                res.render('pages/listingAddress', {
                    id_property: req.params.id_property,
                    country: result.rows[0].country,
                    city: result.rows[0].city,
                    street_and_number: result.rows[0].street_and_number,
                    lat: result.rows[0].lat,
                    lng: result.rows[0].lng,
                });
            else res.render('pages/listingAddress', {id_property: req.params.id_property});
        }
    })
    } else {
        res.render('pages/login');
    }
}

const getListingDetails = (req, res) =>{
    // gets amenities column names from db
    if(req.session && req.session.user) {
    var queryGetBathroomAmenities = `SELECT column_name FROM information_schema.columns WHERE table_name = 'bathroom_amenities'`
    client.query(queryGetBathroomAmenities, (err, result) =>{
        if(err) console.log(err);
        else{
            var queryGetKitchenAmenities = `SELECT column_name FROM information_schema.columns WHERE table_name = 'kitchen_amenities'`
            client.query(queryGetKitchenAmenities, (err1, result1) =>{
                if(err1) console.log(err1);
                else{
                    var queryGetGeneralAmenities = `SELECT column_name FROM information_schema.columns WHERE table_name = 'general_amenities'`
                    client.query(queryGetGeneralAmenities, (err2, result2) =>{
                        if(err2) console.log(err2);
                        else{
                            var queryGetPropertyInfo = `SELECT title, description, guests, bathrooms FROM properties WHERE id_property = $1`
                            client.query(queryGetPropertyInfo, [req.params.id_property], (err3, result3) =>{
                                if(err3) console.log(err3);
                                var queryGetAllAmenities = `SELECT * from general_amenities join kitchen_amenities using(id_property) 
                                            join bathroom_amenities using(id_property) where id_property=$1`;
                                client.query(queryGetAllAmenities, [req.params.id_property], (err4, result4) =>{
                                    if(err4) {console.log(err4); return}
                                    res.render('pages/listingDetails', {
                                        id_property: req.params.id_property,
                                        title: result3.rows[0].title,
                                        description: result3.rows[0].description,
                                        guests: result3.rows[0].guests,
                                        bathrooms: result3.rows[0].bathrooms,
                                        bathroomAmenities: result.rows,
                                        kitchenAmenities: result1.rows,
                                        generalAmenities: result2.rows,
                                        propertyAmenities: result4.rows[0],
                                        error: req.query.error
                                    });
                                })                                
                            });
                        }
                    });
                }
            });
        }
    });
    } else {
        res.render('pages/login');
    }
}

const postListingDetails = (req, res) =>{
    var form = new  formidable.IncomingForm();

    form.parse(req, (err, text_fields) =>{

        const numberRegex = /^[1-9]+[0-9]*$/;

        // data validation
        if(!numberRegex.test(text_fields.guests)){
            res.redirect(`/hosting/listingDetails/${req.params.id_property}?error=guests`);
            return;
        }
        if(!numberRegex.test(text_fields.bathrooms)){
            res.redirect(`/hosting/listingDetails/${req.params.id_property}?error=bathrooms`);
            return;
        }

        var queryUpdateProperty = `UPDATE properties SET title = $1, description = $2, guests = $3, bathrooms = $4 WHERE id_property= $5`
        var paramsUpdateProperty = [text_fields.title, text_fields.description.trim(), text_fields.guests, text_fields.bathrooms, req.params.id_property];
        client.query(queryUpdateProperty, paramsUpdateProperty, (err, result) =>{
            if(err) {console.log(err); return}

            // add general amenities in db
            const generalAmenitiesArr = ['essentials', 'wifi', 'tv', 'iron', 'heating', 'air_conditioning', 'desk', 'free_parking', 
            'paid_parking', 'security_cameras', 'safe', 'smoke_detectors', 'balcony', 'outdoor_space'];
            var queryUpdateGeneralAmenities;
            // if(text_fields.generalAmenities){
                // check if property already has general amenities introduced
                client.query('SELECT id_amenities FROM general_amenities WHERE id_property=$1', [req.params.id_property], (err1, result1) =>{
                    if(err1) {console.log(err1); return;}
                    if(result1.rowCount == 0){
                        queryUpdateGeneralAmenities = `INSERT INTO general_amenities(essentials, wifi, tv, iron, heating, air_conditioning, desk, free_parking, 
                            paid_parking, security_cameras, safe, smoke_detectors, balcony, outdoor_space, id_property) VALUES( `;
                        if(Array.isArray(text_fields.generalAmenities)){
                            for(amenity of generalAmenitiesArr){
                                if(text_fields.generalAmenities.includes(amenity)) queryUpdateGeneralAmenities += `true, `
                                else queryUpdateGeneralAmenities += `false, `
                            }
                        } else{
                            for(amenity of generalAmenitiesArr){
                                if(text_fields.generalAmenities == amenity) queryUpdateGeneralAmenities += `true, `
                                else queryUpdateGeneralAmenities += `false, `
                            }
                        }
                        queryUpdateGeneralAmenities += `$1)`;
                    } else{
                        queryUpdateGeneralAmenities = `UPDATE general_amenities SET `;
                        if(Array.isArray(text_fields.generalAmenities)){
                            for(amenity of generalAmenitiesArr){
                                if(text_fields.generalAmenities.includes(amenity)) queryUpdateGeneralAmenities += `${amenity}=true, `
                                else queryUpdateGeneralAmenities += `${amenity}=false, `
                            }
                        } else{
                            for(amenity of generalAmenitiesArr){
                                if(text_fields.generalAmenities == amenity) queryUpdateGeneralAmenities += `${amenity}=true, `
                                else queryUpdateGeneralAmenities += `${amenity}=false, `
                            }
                        }
                        queryUpdateGeneralAmenities += `id_property=$1 WHERE id_property=$1;`;
                    }

                    console.log(queryUpdateGeneralAmenities);
                    client.query(queryUpdateGeneralAmenities, [req.params.id_property], (err2, result2) =>{
                        if(err2) {console.log(err2); return}




                        // add kitchen amenities in db
                        const kitchenAmenitiesArr = ['kitchen', 'fridge', 'freezer', 'cooker', 'oven', 'microwave', 'cutlery', 'cooking_essentials',
                             'coffee', 'kettle', 'blender', 'dishwasher'];
                        var queryUpdateKitchenAmenities;
                        // if(text_fields.kitchenAmenities){
                            // check if property already has kitchen amenities introduced
                            client.query('SELECT id_amenities FROM kitchen_amenities WHERE id_property=$1', [req.params.id_property], (err3, result3) =>{
                                if(err3) {console.log(err3); return;}
                                if(result3.rowCount == 0){
                                    queryUpdateKitchenAmenities = `INSERT INTO kitchen_amenities(kitchen, fridge, freezer, cooker, oven, microwave, cutlery, cooking_essentials,
                                        coffee, kettle, blender, dishwasher, id_property) VALUES( `;
                                    if(Array.isArray(text_fields.kitchenAmenities)){
                                        for(amenity of kitchenAmenitiesArr){
                                            if(text_fields.kitchenAmenities.includes(amenity)) queryUpdateKitchenAmenities += `true, `
                                            else queryUpdateKitchenAmenities += `false, `
                                        }
                                    } else{
                                        for(amenity of kitchenAmenitiesArr){
                                            if(text_fields.kitchenAmenities == amenity) queryUpdateKitchenAmenities += `true, `
                                            else queryUpdateKitchenAmenities += `false, `
                                        }
                                    }
                                    queryUpdateKitchenAmenities += `$1)`;
                                } else{
                                    queryUpdateKitchenAmenities = `UPDATE kitchen_amenities SET `;
                                    if(Array.isArray(text_fields.kitchenAmenities)){
                                        for(amenity of kitchenAmenitiesArr){
                                            if(text_fields.kitchenAmenities.includes(amenity)) queryUpdateKitchenAmenities += `${amenity}=true, `
                                            else queryUpdateKitchenAmenities += `${amenity}=false, `
                                        }
                                    } else{
                                        for(amenity of kitchenAmenitiesArr){
                                            if(text_fields.kitchenAmenities == amenity) queryUpdateKitchenAmenities += `${amenity}=true, `
                                            else queryUpdateKitchenAmenities += `${amenity}=false, `
                                        }
                                    }
                                    queryUpdateKitchenAmenities += `id_property=$1 WHERE id_property=$1;`;
                                }
                                console.log(queryUpdateKitchenAmenities);
                                client.query(queryUpdateKitchenAmenities, [req.params.id_property], (err4, result4) =>{
                                    if(err4) {console.log(err4); return;}
                                    
                                    // add bathroom amenities in db
                                    const bathroomAmenitiesArr = ['shower_gel', 'shampoo', 'bath_tub', 'bathrobe', 'washing_machine', 'laundry_dryer', 'bidet', 'jacuzzi'];
                                    var queryUpdateBathroomAmenities;
                                    // if(text_fields.bathroomAmenities){
                                        // check if property already has bathroom amenities introduced
                                        client.query('SELECT id_amenities FROM bathroom_amenities WHERE id_property=$1', [req.params.id_property], (err5, result5) =>{
                                            if(err5) {console.log(err5); return;}
                                            if(result5.rowCount == 0){
                                                queryUpdateBathroomAmenities = `INSERT INTO bathroom_amenities(shower_gel, shampoo, bath_tub, bathrobe, washing_machine,
                                                     laundry_dryer, bidet, jacuzzi, id_property) VALUES( `;
                                                if(Array.isArray(text_fields.bathroomAmenities)){
                                                    for(amenity of bathroomAmenitiesArr){
                                                        if(text_fields.bathroomAmenities.includes(amenity)) queryUpdateBathroomAmenities += `true, `
                                                        else queryUpdateBathroomAmenities += `false, `
                                                    }
                                                } else{
                                                    for(amenity of bathroomAmenitiesArr){
                                                        if(text_fields.bathroomAmenities == amenity) queryUpdateBathroomAmenities += `true, `
                                                        else queryUpdateBathroomAmenities += `false, `
                                                    }
                                                }
                                                queryUpdateBathroomAmenities += `$1)`;
                                            } else{
                                                queryUpdateBathroomAmenities = `UPDATE bathroom_amenities SET `;
                                                if(Array.isArray(text_fields.bathroomAmenities)){
                                                    for(amenity of bathroomAmenitiesArr){
                                                        if(text_fields.bathroomAmenities.includes(amenity)) queryUpdateBathroomAmenities += `${amenity}=true, `
                                                        else queryUpdateBathroomAmenities += `${amenity}=false, `
                                                    }
                                                } else{
                                                    for(amenity of bathroomAmenitiesArr){
                                                        if(text_fields.bathroomAmenities == amenity) queryUpdateBathroomAmenities += `${amenity}=true, `
                                                        else queryUpdateBathroomAmenities += `${amenity}=false, `
                                                    }
                                                }
                                                queryUpdateBathroomAmenities += `id_property=$1 WHERE id_property=$1;`;
                                            }
                                            console.log(queryUpdateBathroomAmenities);
                                            client.query(queryUpdateBathroomAmenities, [req.params.id_property], (err6, result6) =>{
                                                if(err6) {console.log(err6); return}
                                                if(text_fields.save_btn == '') res.redirect(`/hosting/listingDetails/${req.params.id_property}`);
                                                if(text_fields.rules_btn == '')res.redirect(`/hosting/listingPhotos/${req.params.id_property}`);
                                            });
                                        });
                                    // }
                                });
                            });
                        // }                        
                    });
                });
            // }           
        });
    });
}

const getListingPhotos = (req, res) =>{
    if(req.session && req.session.user){
    var queryGetPhotos = `SELECT * FROM photos WHERE id_property=$1`;
    client.query(queryGetPhotos, [req.params.id_property], (err, result)=>{
        if(err) {console.log(err); return;}
        res.render('pages/listingPhotos', {id_property: req.params.id_property, photos: result.rows[0]});
    })
    } else {
        res.render('pages/login');
    }
}

const postListingPhotos = (req, res) =>{
    var form = new formidable.IncomingForm();
    var images_path = new Object;
    form.parse(req, (err, text_fields) =>{
        var queryImageExists = `SELECT id_photos FROM photos WHERE id_property=$1`;
        client.query(queryImageExists, [req.params.id_property], (err, result) =>{
            if(err) {console.log(err); return;}
            if(result.rowCount == 0){
                client.query('INSERT INTO photos(id_property) VALUES($1)', [req.params.id_property], (err1, result1) =>{
                    if(err1) {console.log(err1); return;}
                });
            }

            for(const image in images_path){

                var queryAddImage = `UPDATE photos SET ${image}=$1 WHERE id_property=$2`;
                client.query(queryAddImage, [images_path[image], req.params.id_property], (err2, result2) =>{
                    if(err2) console.log(err2);
                });

                var small_dim = 300;
                var medium_dim = 800;

                // sharp(`${__dirname}/../../${images_path[image]}`).resize(small_dim).toFile(`${propertyFolder}/${image}-${small_dim}.jpg`);
                // sharp(`${__dirname}/../../${images_path[image]}`).resize(medium_dim).toFile(`${propertyFolder}/${image}-${medium_dim}.jpg`);
            }
            // if(text_fields.save_btn == '') res.redirect(`/hosting/listingPhotos/${req.params.id_property}`);
            // if(text_fields.rules_btn == '') res.redirect(`/hosting/listingRules/${req.params.id_property}`);
            if(text_fields.save_btn == '') res.redirect(`/hosting/generatePhotos/${req.params.id_property}?save=true`);
            if(text_fields.rules_btn == '') res.redirect(`/hosting/generatePhotos/${req.params.id_property}`);
        });
    });
    form.on("fileBegin", (name, file) =>{
        if(!file.originalFilename) return;
        propertyFolder = __dirname + '/../../public/photos/properties/' + req.params.id_property + '/';
        console.log(propertyFolder)
        if(!fs.existsSync(propertyFolder)){     // if folder for current property doesn't exist, create it
            fs.mkdirSync(propertyFolder);
        }
        
        extension = file.originalFilename.split('.');
        file.filepath = propertyFolder + name + '.' + extension[extension.length-1];

        switch(name){
            case 'big_picture':
                images_path.big_picture = `public/photos/properties/${req.params.id_property}/${name}.${extension[extension.length-1]}`;
                break;
            case 'small_pic_1':
                images_path.small_pic_1 = `public/photos/properties/${req.params.id_property}/${name}.${extension[extension.length-1]}`;
                break;
            case 'small_pic_2':
                images_path.small_pic_2 = `public/photos/properties/${req.params.id_property}/${name}.${extension[extension.length-1]}`;
                break;
            case 'small_pic_3':
                images_path.small_pic_3 = `public/photos/properties/${req.params.id_property}/${name}.${extension[extension.length-1]}`;
                break;
            case 'small_pic_4':
                images_path.small_pic_4 = `public/photos/properties/${req.params.id_property}/${name}.${extension[extension.length-1]}`;
                break;
        }
    });
    form.on('file', (name, file) =>{
        console.log(`Added file.`);
    })
    // form.on('end', () =>{
    //     var small_dim = 300;
    //     var medium_dim = 800;
    //     propertyFolder = __dirname + '/../../public/photos/properties/' + req.params.id_property + '/';

    //     console.log(images_path);
    //     // for(const image in images_path){
    //     //     sharp(`${__dirname}/../../${images_path[image]}`).resize(medium_dim).toFile(`${propertyFolder}/${image}-${medium_dim}.jpg`);
    //     // }

    //     // sharp(`${__dirname}/../../${images_path[image]}`).resize(small_dim).toFile(`${propertyFolder}/${image}-${small_dim}.jpg`);
        
    // })
}

const generatePhotos = (req, res) =>{
    //:id_property
    var small_dim = 300;
    var medium_dim = 800;
    var queryGetPhotos = `SELECT big_picture, small_pic_1, small_pic_2, small_pic_3, small_pic_4 FROM photos WHERE id_property=$1`;
    client.query(queryGetPhotos, [req.params.id_property], (err, result) =>{
        if(err) {console.log(err); return;}
        //var images = [result.rows[0].big_picture, result.rows[0].small_pic_1, result.rows[0].small_pic_2, result.rows[0].small_pic_3, result.rows[0].small_pic_4];
        console.log(result.rows[0]);
        if(result.rows[0].big_picture){
            sharp(`${__dirname}/../../${result.rows[0].big_picture}`).resize(medium_dim).toFile(`${propertyFolder}/big_picture-${medium_dim}.jpg`);
        }
        if(result.rows[0].small_pic_1){
            sharp(`${__dirname}/../../${result.rows[0].small_pic_1}`).resize(medium_dim).toFile(`${propertyFolder}/small_pic_1-${medium_dim}.jpg`);
        }
        if(result.rows[0].small_pic_2){
            sharp(`${__dirname}/../../${result.rows[0].small_pic_2}`).resize(medium_dim).toFile(`${propertyFolder}/small_pic_2-${medium_dim}.jpg`);
        }
        if(result.rows[0].small_pic_3){
            sharp(`${__dirname}/../../${result.rows[0].small_pic_3}`).resize(medium_dim).toFile(`${propertyFolder}/small_pic_3-${medium_dim}.jpg`);
        }
        if(result.rows[0].small_pic_4){
            sharp(`${__dirname}/../../${result.rows[0].small_pic_4}`).resize(medium_dim).toFile(`${propertyFolder}/small_pic_4-${medium_dim}.jpg`);
        }
        // if(text_fields.save_btn == '') res.redirect(`/hosting/listingPhotos/${req.params.id_property}`);
        // if(text_fields.rules_btn == '') res.redirect(`/hosting/listingRules/${req.params.id_property}`);

        var delayInMilliseconds = 1000; //1 second

        setTimeout(function() {
            if(req.query.save == "true") res.redirect(`/hosting/listingPhotos/${req.params.id_property}`);
            else res.redirect(`/hosting/listingRules/${req.params.id_property}`);
        }, delayInMilliseconds);
    })
}

const getListingRules = (req, res) =>{
    if(req.session && req.session.user){
    var error = '';
    if(req.query.error){
        switch(req.query.error){
            case "price":
                error = 'Price is invalid. Please enter a number greater than 0, without decimals';
                break;
            case "discount":
                error = 'Discount value invalid. Please enter a number greater or equal to 0, without decimals';
                break;
            case "discounttoobig":
                error = "Discount given is too big. Discounts cannot exceed the price per night";
                break;
            case "times":
                error = "Checkin time must be later than checkout time";
                break;
        }
    }
    
    var queryGetRules = `SELECT price, week_discount, checkin, checkout, for_kids, smoking_allowed, pets_allowed, events_allowed FROM properties WHERE id_property= $1`;
    client.query(queryGetRules, [req.params.id_property], (err, result) =>{
        res.render('pages/listingRules', {
            id_property: req.params.id_property,
            price: result.rows[0].price,
            week_discount: result.rows[0].week_discount,
            checkin: result.rows[0].checkin,
            checkout: result.rows[0].checkout,
            for_kids: result.rows[0].for_kids,
            smoking_allowed: result.rows[0].smoking_allowed,
            pets_allowed: result.rows[0].pets_allowed,
            events_allowed: result.rows[0].events_allowed,
            error: error
        });
    });
    } else {
        res.render('pages/login');
    }
}

const postAddRules = (req, res) =>{
    var form = new  formidable.IncomingForm();
    form.parse(req, (err, text_fields) =>{
        
        // data validation
        const numberRegex = /^[1-9]+[0-9]*$/;
        const discountRegex = /^[0-9]+$/;

        if(!numberRegex.test(text_fields.price)){
            res.redirect(`/hosting/listingRules/${req.params.id_property}?error=price`);
            return;
        }

        if(!discountRegex.test(text_fields.week_discount) || !discountRegex.test(text_fields.less_guests_discount)){
            res.redirect(`/hosting/listingRules/${req.params.id_property}?error=discount`);
            return;
        }

        if(parseInt(text_fields.week_discount) >= parseInt(text_fields.price) || parseInt(text_fields.less_guests_discount) >= parseInt(text_fields.price)){
            res.redirect(`/hosting/listingRules/${req.params.id_property}?error=discounttoobig`);
            return;
        }

        if(text_fields.checkin <= text_fields.checkout){
            res.redirect(`/hosting/listingRules/${req.params.id_property}?error=times`);
            return;
        }

        var queryUpdateProperty = `UPDATE properties SET price = $1, week_discount = $2, checkin = $3, checkout = $4,
                                    for_kids = $5, smoking_allowed = $6, pets_allowed = $7, events_allowed = $8, less_guests_discount = $9  WHERE id_property= $10`;
        var paramsUpdateProperty = [text_fields.price, text_fields.week_discount, text_fields.checkin, text_fields.checkout, 
            (text_fields.rules && text_fields.rules.includes('for_kids')) ? true : false, (text_fields.rules && text_fields.rules.includes('smoking_allowed')) ? true : false,
            (text_fields.rules && text_fields.rules.includes('pets_allowed')) ? true : false, (text_fields.rules && text_fields.rules.includes('events_allowed')) ? true : false,
            text_fields.less_guests_discount, req.params.id_property];
        client.query(queryUpdateProperty, paramsUpdateProperty, (err, result) =>{
            if(err) console.log(err);
            else{
                // res.redirect(`/hosting/`);
                if(text_fields.save_btn == '') res.redirect(`/hosting/listingRules/${req.params.id_property}`);
                if(text_fields.finish_btn == '') res.redirect(`/hosting/?id_property=${req.params.id_property}`);
            }
        });
    });
}

const getBookingHistory = (req, res) =>{
    // :id_property
    if(req.session && req.session.user){
    var queryGetOldBookings = `SELECT *, u.firstname, u.lastname FROM bookings INNER JOIN users u USING(id_user) WHERE checkout < CURRENT_DATE OR (status != 'confirmed' AND status != 'pending') AND id_property=$1 ORDER BY checkin DESC LIMIT 10`;
    client.query(queryGetOldBookings, [req.params.id_property], (err, result) =>{
        if(err) {console.log(err); return;}
        
        res.render('pages/bookingHistory', {
            bookings: result.rows,
        })
    });
    } else{
        res.render('pages/login');
    }
}

const getPropertyReviews = (req, res) =>{
    // :id_property
    if(req.session && req.session.user){
    var queryGetReviews = `SELECT r.*, u.firstname, u.lastname, u.profile_pic FROM reviews r INNER JOIN users u USING(id_user) WHERE id_property=$1`;
        client.query(queryGetReviews, [req.params.id_property], (err1, result1) =>{
            if(err1) {console.log(err1); return;}
            res.render('pages/propertyReviews', {
                reviews: result1.rows
            })
        });
    } else{
        res.render('pages/login');
    }
}

function verifyPropertyListing(id_property){
        var queryGetPropertyInfo = `SELECT id_property, title, guests, bathrooms, r.id_room, a.id_address, p.*, price, checkin, checkout
        FROM properties 
        INNER JOIN rooms r USING(id_property) 
        INNER JOIN address a USING(id_property) 
        INNER JOIN photos p USING(id_property)
        WHERE id_property=$1`;
        client.query(queryGetPropertyInfo, [id_property], (err, result) =>{
            if(err) {console.log(err); return;}
            if(result.rowCount == 0) return false;
            var data = result.rows[0];
            if(!data.title || !data.guests || !data.bathrooms || !data.price || !data.checkin || !data.checkout || !data.big_picture
                || !data.small_pic_1 || !data.small_pic_2 || !data.small_pic_3 || !data.small_pic_4)
                    return false;
            return true;
        });
}

module.exports = {
    getHostDashboard,
    getBecomeHost,
    postNewListing,
    getListingAddress,
    getListingDetails,
    postListingDetails,
    getListingPhotos,
    postListingPhotos,
    generatePhotos,
    getListingRules,
    postAddRules,
    getBookingHistory,
    getPropertyReviews,
    verifyPropertyListing
};