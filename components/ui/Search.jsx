import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FlashList } from "@shopify/flash-list";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

import { Link, router } from "expo-router";

export const Search = () => {
  const [focused, setFocused] = useState(false);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [hovered, setHovered] = useState(null);

  const fetchResults = async (text) => {
    setResults([]);
    if (text.length > 3) {
      console.log(text);
      const { data, error } = await supabase.rpc("search_club_player_or_competition", {
        search_term: text,
      });
      if (error) console.log(error);
      console.log(data)
      const clubs = data.clubs.map((club) => ({ ...club, type: "club" }));
      const players = data.players.map((player) => ({
        ...player,
        type: "player",
      }));
      const competitions = data.competitions.map((competition) => ({ ...competition, type: "competition" }));
      console.log([...clubs, ...players]);
      setResults([...clubs, ...players, ...competitions]);
    }
  };

  const handleSubmit = async () => {
    if (results.length > 0) {
      results[0].type === "club"
        ? router.push(`/club/${results[0].id}`)
        : results[0].type === 'player' ? router.push(`/player/${results[0].id}`)
        : router.push(`/competition/${results[0].id}`)
    } else {
      router.push(`/query/${encodeURIComponent(input)}`);
    }
  };

  const renderResult = ({ item, index }) => (
    <Link
      asChild
      href={{
        pathname: item.type == "club" ? "/club/[id]" : item.type ==='player' ? "/player/[id]" : '/competition/[id]',
        params: { id: item.id },
      }}
    >
      <TouchableOpacity
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        onPress={() => {
          setInput("");
          setResults([]);
        }}
        style={{ backgroundColor: hovered === index && "#e4e4e4ff" }}
      >
        {item.type == "club" ? (
          <View className="flex flex-row items-center gap-10 p-2">
            <Text
              className="text-xs font-supreme uppercase"
              style={{ color: "gray", width: 50 }}
            >
              {item.type}
            </Text>
            <View className="flex flex-row items-center gap-2 ">
              <Image
                source={{ uri: item.logo }}
                style={{ width: 35, height: 35 }}
                resizeMode="contain"
              />
              <Text className="text-sm font-supreme">{item.club_name}</Text>
            </View>
          </View>
        ) : 
        item.type == "player" ?
        (
          <View className="flex flex-row items-center gap-10 p-2">
            <Text
              className="text-xs font-supreme uppercase"
              style={{ color: "gray", width: 50 }}
            >
              {item.type}
            </Text>
            <View className="flex flex-row items-center gap-2 ">
              <Image
                source={{ uri: item.photo }}
                style={{ width: 35, height: 35 }}
                resizeMode="contain"
                className="rounded-full"
              />
              <Text className="text-sm font-supreme">
                {item.transfermarkt_name}
              </Text>
            </View>
          </View>
        )
        :
        (
          <View className="flex flex-row items-center gap-10 p-2">
            <Text
              className="text-xs font-supreme uppercase"
              style={{ color: "gray", width: 75 }}
            >
              {item.type}
            </Text>
            <View className="flex flex-row items-center gap-2 ">
              <Image
                source={{ uri: item.logo }}
                style={{ width: 35, height: 35 }}
                resizeMode="contain"
                className="rounded-full"
              />
              <Text className="text-md font-supreme">
                {item.name}
              </Text>
            </View>
          </View>
        )
      }
      </TouchableOpacity>
    </Link>
  );
  return (     
     <TouchableWithoutFeedback onPress={()=> Platform.OS !== "web" && Keyboard.dismiss}  accessibilityRole="button">

    <View className="relative flex-1" style={{ zIndex: 999 }}>
      <View
        className="rounded-lg p-2 px-4 pr-10  bg-white flex  flex-row justify-between items-center"
        style={{
          borderColor: focused ? "#A477C7" : "grey",
          borderWidth: focused ? 1 : 1,
        }}
      >
        <TextInput
          className="w-full"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ outlineStyle: "none", paddingLeft: 10 }}
          placeholderTextColor="grey"
          value={input}
          placeholder="Search players, stats, or clubs"
          onChangeText={(text) => {
            setInput(text);
            fetchResults(text);
          }}
          onSubmitEditing={handleSubmit}
        ></TextInput>
        <FontAwesome name="search" size={20} color="#A477C7" />
      </View>
      {results.length > 0 &&
        (Platform.OS === "web" ? (
          <View
            className="rounded-xl p-2 w-full bg-white flex flex-col absolute shadow-lg"
            style={{ top: 50, zIndex: 10 }}
          >
            <FlashList
              data={results}
              renderItem={renderResult}
              estimatedItemSize={50}
            />
          </View>
        ) : (
          <View
            className=" w-full  "
          >
            <FlatList
              data={results}
              renderItem={renderResult}
              keyExtractor={(item) => `${item.type}-${item.id}`}
            />
          </View>
        ))}
    </View>        
    </TouchableWithoutFeedback>

  );
};

export default Search;

const styles = StyleSheet.create({});
