import type { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import ErrorPage from 'next/error';
import Link from "next/link";
import { IconHoverEffect } from "~/components/IconHoverEffect";
import { VscArrowLeft } from "react-icons/vsc";
import { ProfileImage } from "~/components/ProfileImage";
import { InfiniteTweetList } from "~/components/InfiniteTweetList";
import { Button } from "~/components/Button";
import { useSession } from "next-auth/react";


const ProfilePage : NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({id}) => {

    const {data : profile} = api.profile.getById.useQuery({id})
    const tweets = api.tweet.infinitProfileFeed.useInfiniteQuery(
        {userId: id}, 
        {getNextPageParam : lastPage => lastPage.nextCursor}
    )

    if (profile == null || profile.name == null){
        return <ErrorPage statusCode={404}/>
    }
    return <>
        <Head>
            <title>{`Twitter Clone - ${profile.name}`}</title>
        </Head>
        <header
            className="sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2"
        >
            <Link href='..' className="mr-2"> 
                <IconHoverEffect>
                    <VscArrowLeft className="h-6 w-6"/>
                </IconHoverEffect>
            </Link>
            <ProfileImage
                src={profile.image}
                className="flex-shrink-0"
            />
            <div className="ml-2 flex-grow">
                <h1 className="text-lg font-bold">{profile.name}</h1>
                <div className="text-gray-500">
                    {profile.tweetsCount} {" "}
                    {getPlural(profile.tweetsCount, 'Tweet', 'Tweets')} - {" "}
                    {profile.followersCount} {" "}
                    {getPlural(profile.followersCount, 'Follower', 'Followers')} - {" "}
                    {profile.followsCount} Following
                </div>
            </div>
            <FollowButton isFollowing={profile.isFollowing} userId={id} onClick={()=> null}/>
        </header>
        <main>
            <InfiniteTweetList
                tweets = {tweets.data?.pages.flatMap(page => page.tweets)}
                isError = {tweets.isError}
                isLoading = {tweets.isLoading}
                fetchNewTweets = {tweets.fetchNextPage}
                hasMore = {tweets.hasNextPage}
            />
        </main>
    </> 
}

function FollowButton ({userId, isFollowing, onClick} : {
    userId : string,
    isFollowing : boolean,
    onClick : () => void
}) {

    const session = useSession()
    if (session.status !== 'authenticated' || session.data.user.id === userId)
        return null;
    return <Button
        onClick={onClick}
        small
        grey={isFollowing}
    >
        {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>;
}

const pluralRules = new Intl.PluralRules()
function getPlural (number : number, singular : string, plural: string) {
    return pluralRules.select(number) === 'one' ? singular : plural
}


export const getStaticPaths : GetStaticPaths = () => {
    return {
        paths : [],
        fallback: 'blocking'
    }
}

export async function getStaticProps (context : GetStaticPropsContext<{id : string}>) {
    const id = context.params?.id

    if (id == null){
        return {
            redirect : {
                destination :'/'
            }
        }
    }

    const ssg = ssgHelper()
    await ssg.profile.getById.prefetch({id});

    return {
        props : {
            trpcState : ssg.dehydrate(),
            id
        }
    }
}

export default ProfilePage