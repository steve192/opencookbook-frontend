import { Pressable, ScrollViewProps, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';


export const SideScroller = (props: ScrollViewProps) => {

    return (
        <View>

            <ScrollView
                {...props}
                horizontal={true}>
                {props.children}
            </ScrollView>
            <Pressable
                style={{
                    position: "absolute",
                    right: 0,
                    width: 80,
                    height: "100%",
                }} >
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent']}
                    start={[1, 0]}
                    end={[0, 0]}
                    style={{ width: "100%", "height": "100%" }}
                />
            </Pressable>
        </View>
    )
}